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
const normalizeSettlementType = value => String(value || '').trim() === 'vignette' ? 'vignette' : 'campaign'
const normalizeLanternYear = value => Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? Number(value) : 0
const isReturnEntry = value => value && typeof value.id === 'string' && value.id &&
  typeof value.survivorId === 'string' && value.survivorId &&
  typeof value.survivorName === 'string' && value.survivorName.trim() &&
  Number.isSafeInteger(value.lanternYear) && value.lanternYear >= 0 &&
  typeof value.returnedAt === 'string' && !Number.isNaN(Date.parse(value.returnedAt)) &&
  typeof value.isAlive === 'boolean'

function isOperation(operation) {
  return operation && typeof operation.id === 'string' && operation.id &&
    typeof operation.survivorId === 'string' && typeof operation.savedDigest === 'string' &&
    /^[a-f0-9]{64}$/.test(operation.savedDigest) && typeof operation.fileName === 'string' &&
    operation.fileName.endsWith('.json') && path.basename(operation.fileName) === operation.fileName &&
    !reserved(operation.fileName) && ['prepared', 'committed', 'complete', 'cancelled'].includes(operation.state) &&
    Array.isArray(operation.knowledges) && operation.knowledges.every(isDefinition) &&
    (typeof operation.returnEntry === 'undefined' || isReturnEntry(operation.returnEntry))
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
      value.knowledges.some(entry => !entry || typeof entry.id !== 'string' || !entry.id || !isDefinition(entry.definition)) ||
      (typeof value.returns !== 'undefined' && (!Array.isArray(value.returns) || value.returns.some(entry => !isReturnEntry(entry))))) {
      throw new Error('Invalid settlement record; restore or repair it. It has not been replaced.')
    }
    value.settlementType = normalizeSettlementType(value.settlementType)
    value.settlementTypeLocked = typeof value.settlementTypeLocked === 'boolean'
      ? value.settlementTypeLocked
      : value.settlementType === 'vignette' || Boolean(value.vignetteTemplate)
    value.lanternYear = normalizeLanternYear(value.lanternYear)
    value.returns = Array.isArray(value.returns) ? value.returns : []
    return value
  }
  const now = stamp()
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    revision: 0,
    createdAt: now,
    updatedAt: now,
    settlementType: 'campaign',
    settlementTypeLocked: false,
    lanternYear: 0,
    knowledges: [],
    returns: []
  }
}

function register(basePath, entries, survivorId, returnEntry) {
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
  const returnAdded = isReturnEntry(returnEntry) && !value.returns.some(entry => entry.id === returnEntry.id)
  if (returnAdded) value.returns.push(returnEntry)
  if (added || returnAdded || !fs.existsSync(path.join(basePath, RECORD))) {
    value.revision++
    value.updatedAt = stamp()
    write(basePath, RECORD, value)
  }
  return { knowledgeAdded: added, returnAdded }
}

// Only replay settlement metadata registration. Never replay a survivor write or bypass its revision check.
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
      const result = register(basePath, operation.knowledges, operation.survivorId, operation.returnEntry)
      operation.state = 'complete'
      operation.error = null
      event(log, operation, 'register-settlement', 'complete', `${result.knowledgeAdded} knowledge added; return ${result.returnAdded ? 'added' : 'not added'}`)
    } catch (err) {
      operation.error = err.message
      event(log, operation, 'register-settlement', 'failed', err.message)
    }
    operation.attempts = (operation.attempts || 0) + 1
    changed = true
  }
  if (changed) write(basePath, JOURNAL, log)
  return log
}

function prepare(basePath, fileName, person, options = {}) {
  // Persist recovery decisions before another save can replace the evidence on disk.
  const log = recover(basePath)
  const operationId = crypto.randomUUID()
  const settlement = record(basePath)
  const returnEntry = options.markReturned && settlement.settlementType === 'campaign'
    ? {
        id: operationId,
        survivorId: person.id,
        survivorName: String(person.name || '').trim(),
        lanternYear: settlement.lanternYear,
        returnedAt: person.lastReturned,
        isAlive: Boolean(person.isAlive)
      }
    : undefined
  const operation = {
    id: operationId,
    survivorId: person.id,
    fileName,
    savedDigest: digest(person),
    knowledges: definitions(person),
    ...(returnEntry ? { returnEntry } : {}),
    state: 'prepared',
    attempts: 0
  }
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
    return pending.length ? `Survivor saved. ${pending.length} settlement update(s) pending recovery. ${pending.find(op => op.error)?.error || ''}`.trim() : null
  } catch (err) { return `Survivor saved. Settlement recovery needs attention: ${err.message}` }
}

function saveSettings(basePath, current, settings) {
  // The caller has recovered/indexed the record and checked its revision synchronously.
  const settlementType = normalizeSettlementType(settings.settlementType)
  if (current.settlementTypeLocked && settlementType !== normalizeSettlementType(current.settlementType)) {
    throw new Error('Settlement type cannot be changed after it has been set.')
  }
  const value = {
    ...current,
    name: settings.name,
    settlementType,
    settlementTypeLocked: true,
    lanternYear: normalizeLanternYear(settings.lanternYear),
    revision: current.revision + 1,
    updatedAt: stamp()
  }
  delete value.pendingOperations
  write(basePath, RECORD, value)
  return { ...value, pendingOperations: current.pendingOperations }
}

function saveName(basePath, current, name) {
  const value = {
    ...current,
    name,
    revision: current.revision + 1,
    updatedAt: stamp()
  }
  delete value.pendingOperations
  write(basePath, RECORD, value)
  return { ...value, pendingOperations: current.pendingOperations }
}

function setVignetteTemplate(basePath, current, survivors) {
  if (normalizeSettlementType(current.settlementType) !== 'vignette' || !current.settlementTypeLocked) {
    throw new Error('Settlement type must be set to Vignette before saving a template.')
  }
  const value = {
    ...current,
    vignetteTemplate: {
      savedAt: stamp(),
      survivors
    },
    revision: current.revision + 1,
    updatedAt: stamp()
  }
  delete value.pendingOperations
  write(basePath, RECORD, value)
  return { ...value, pendingOperations: current.pendingOperations }
}

function replaceAfterRestore(basePath, current) {
  const value = {
    ...current,
    knowledges: [],
    revision: current.revision + 1,
    updatedAt: stamp()
  }
  delete value.pendingOperations
  write(basePath, RECORD, value)
  write(basePath, JOURNAL, { schemaVersion: 1, nextSequence: 1, operations: [], events: [] })
}

module.exports = {
  saveSettings,
  saveName,
  setVignetteTemplate,
  replaceAfterRestore,
  reserved,
  prepare,
  committed,
  failed,
  recover,
  getRecord,
  keyFor,
  warning
}
