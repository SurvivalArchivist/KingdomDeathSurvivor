const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const RECORD = 'settlement.json'
const JOURNAL = 'settlement-journal.json'
const reserved = name => [RECORD, JOURNAL].includes(String(name).toLowerCase())
const stamp = () => new Date().toISOString()
const keyFor = entry => JSON.stringify([String(entry.name || '').trim().toLowerCase(), Math.max(1, Number(entry.knowledgeLevel) || 1)])
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const isDefinition = value => value && typeof value.name === 'string' && value.name.trim() && Number.isInteger(value.knowledgeLevel) && value.knowledgeLevel >= 1

function isOperation(operation) {
  return operation && typeof operation.id === 'string' && operation.id &&
    typeof operation.survivorId === 'string' && typeof operation.savedDigest === 'string' &&
    /^[a-f0-9]{64}$/.test(operation.savedDigest) && typeof operation.fileName === 'string' &&
    operation.fileName.endsWith('.json') && path.basename(operation.fileName) === operation.fileName &&
    !reserved(operation.fileName) && ['prepared', 'committed', 'complete', 'cancelled'].includes(operation.state) &&
    Array.isArray(operation.knowledges) && operation.knowledges.every(isDefinition)
}

function read(basePath, name) {
  const file = path.join(basePath, name)
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
}

function write(basePath, name, value) {
  const file = path.join(basePath, name)
  const temp = `${file}.${crypto.randomUUID()}.tmp`
  try {
    const fd = fs.openSync(temp, 'wx')
    try {
      fs.writeFileSync(fd, JSON.stringify(value, null, 2), 'utf8')
      fs.fsyncSync(fd)
    } finally { fs.closeSync(fd) }
    fs.renameSync(temp, file)
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp)
  }
}

function journal(basePath) {
  const value = fs.existsSync(path.join(basePath, JOURNAL)) ? read(basePath, JOURNAL) : { schemaVersion: 1, nextSequence: 1, operations: [], events: [] }
  if (!value || value.schemaVersion !== 1 || !Array.isArray(value.operations) || !Array.isArray(value.events) ||
    !Number.isSafeInteger(value.nextSequence) || value.nextSequence < 1 || !value.operations.every(isOperation) ||
    value.events.some(entry => !entry || !Number.isSafeInteger(entry.sequence) || entry.sequence < 1 || entry.sequence >= value.nextSequence)) {
    throw new Error('Invalid settlement journal; restore or repair it before saving.')
  }
  return value
}

function event(log, operation, action, outcome, detail = '') {
  log.events.push({ sequence: log.nextSequence++, operationId: operation.id, survivorId: operation.survivorId, action, outcome, detail, at: stamp() })
}

function definitions(person) {
  return [...(person.knowledge || []), ...(person.tenetKnowledge || [])]
    .filter(entry => String(entry.name || '').trim())
    .map(entry => {
      const { currentObservations, observations, ...definition } = entry
      return { ...definition, name: String(entry.name).trim(), knowledgeLevel: Math.max(1, Number(entry.knowledgeLevel) || 1) }
    })
}

function record(basePath) {
  const value = read(basePath, RECORD)
  if (fs.existsSync(path.join(basePath, RECORD))) {
    if (!value || value.schemaVersion !== 1 || typeof value.id !== 'string' || !Array.isArray(value.knowledges) || !Number.isSafeInteger(value.revision) ||
      value.knowledges.some(entry => !entry || typeof entry.id !== 'string' || !entry.id || !isDefinition(entry.definition))) {
      throw new Error('Invalid settlement record; restore or repair it. It has not been replaced.')
    }
    return value
  }
  const now = stamp()
  return { schemaVersion: 1, id: crypto.randomUUID(), revision: 0, createdAt: now, updatedAt: now, knowledges: [] }
}

function register(basePath, entries, survivorId) {
  const value = record(basePath)
  const keys = new Set(value.knowledges.map(entry => keyFor(entry.definition)))
  let added = 0
  for (const definition of entries) {
    const key = keyFor(definition)
    if (keys.has(key)) continue
    keys.add(key)
    value.knowledges.push({ id: crypto.randomUUID(), definition, firstSurvivorId: survivorId, discoveredAt: stamp() })
    added++
  }
  if (added || !fs.existsSync(path.join(basePath, RECORD))) {
    value.revision++
    value.updatedAt = stamp()
    write(basePath, RECORD, value)
  }
  return added
}

// Only replay settlement registration. Never replay a survivor write or bypass its revision check.
function recover(basePath) {
  const log = journal(basePath)
  let changed = false
  for (const operation of log.operations) {
    if (operation.state === 'prepared') {
      const saved = read(basePath, operation.fileName)
      operation.state = saved && digest(saved) === operation.savedDigest ? 'committed' : 'cancelled'
      event(log, operation, 'save-survivor', operation.state, 'Recovered interrupted save')
      changed = true
    }
    if (operation.state !== 'committed') continue
    try {
      const added = register(basePath, operation.knowledges, operation.survivorId)
      operation.state = 'complete'
      operation.error = null
      event(log, operation, 'register-knowledge', 'complete', `${added} added; remaining already present`)
    } catch (err) {
      operation.error = err.message
      event(log, operation, 'register-knowledge', 'failed', err.message)
    }
    operation.attempts = (operation.attempts || 0) + 1
    changed = true
  }
  if (changed) write(basePath, JOURNAL, log)
  return log
}

function prepare(basePath, fileName, person) {
  // Persist recovery decisions before another save can replace the evidence on disk.
  const log = recover(basePath)
  const operation = { id: crypto.randomUUID(), survivorId: person.id, fileName, savedDigest: digest(person), knowledges: definitions(person), state: 'prepared', attempts: 0 }
  log.operations.push(operation)
  event(log, operation, 'save-survivor', 'prepared')
  write(basePath, JOURNAL, log)
  return operation.id
}

function committed(basePath, id) {
  const log = journal(basePath)
  const operation = log.operations.find(entry => entry.id === id)
  operation.state = 'committed'
  event(log, operation, 'save-survivor', 'committed')
  write(basePath, JOURNAL, log)
  recover(basePath)
}

function failed(basePath, id, error) {
  const log = journal(basePath)
  const operation = log.operations.find(entry => entry.id === id)
  operation.state = 'cancelled'
  operation.error = error.message
  event(log, operation, 'save-survivor', 'failed', error.message)
  write(basePath, JOURNAL, log)
}

function getRecord(basePath, survivors) {
  if (!fs.existsSync(basePath) || !fs.statSync(basePath).isDirectory()) throw new Error('Select an existing Survivors folder first.')
  const log = recover(basePath)
  const keys = new Set(record(basePath).knowledges.map(entry => keyFor(entry.definition)))
  for (const operation of log.operations.filter(entry => entry.state === 'committed')) {
    for (const definition of operation.knowledges) keys.add(keyFor(definition))
  }
  // Bootstrap/repair from persisted survivors only; never from an editor draft.
  let queued = false
  for (const { fileName, person } of survivors()) {
    const missing = definitions(person).filter(definition => !keys.has(keyFor(definition)))
    if (!missing.length) continue
    for (const definition of missing) keys.add(keyFor(definition))
    const operation = { id: crypto.randomUUID(), survivorId: person.id, fileName, savedDigest: digest(person), knowledges: missing, state: 'committed', attempts: 0 }
    log.operations.push(operation)
    event(log, operation, 'index-saved-survivor', 'committed', 'Discovered in existing saved data')
    queued = true
  }
  if (queued) {
    write(basePath, JOURNAL, log)
    recover(basePath)
  }
  register(basePath, [], null)
  return { ...record(basePath), pendingOperations: journal(basePath).operations.filter(entry => entry.state === 'committed').length }
}

function warning(basePath) {
  try {
    const pending = journal(basePath).operations.filter(op => ['prepared', 'committed'].includes(op.state))
    return pending.length ? `Survivor saved. ${pending.length} settlement registration(s) pending recovery. ${pending.find(op => op.error)?.error || ''}`.trim() : null
  } catch (err) { return `Survivor saved. Settlement recovery needs attention: ${err.message}` }
}

module.exports = { reserved, prepare, committed, failed, recover, getRecord, keyFor, warning }
