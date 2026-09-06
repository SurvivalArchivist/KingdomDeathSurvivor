const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const data = require('../src/dataService')
const settlement = require('../src/settlementService')

function setup(t) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-settlement-test-'))
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }))
  return folder
}
const read = (folder, name) => JSON.parse(fs.readFileSync(path.join(folder, name), 'utf8'))
const knowledge = (name = 'Lantern', knowledgeLevel = 1) => ({ name, knowledgeLevel, currentObservations: 2, rules: 'Retained rules' })

test('saved Knowledge and Tenet Knowledge share permanent, level-specific settlement identities', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  person.tenetKnowledge = [knowledge(' lantern ')]
  const file = data.savePerson(folder, person)
  let record = data.getSettlementRecord(folder)
  assert.equal(record.knowledges.length, 1)
  const id = record.knowledges[0].id
  assert.equal(record.knowledges[0].definition.currentObservations, undefined)
  assert.equal(record.knowledges[0].definition.rules, 'Retained rules')
  const saved = data.loadPerson(folder, file)
  saved.knowledge = [knowledge('Lantern', 2)]
  saved.tenetKnowledge = []
  data.savePerson(folder, saved)
  data.deletePerson(folder, file)
  record = data.getSettlementRecord(folder)
  assert.equal(record.knowledges.length, 2)
  assert.equal(record.knowledges[0].id, id)
  assert.deepEqual(data.listPeople(folder), [])
  assert.equal(data.listPeopleSummaries(folder).totalFiles, 0)
  assert.equal(read(folder, 'settlement-journal.json').operations.every(op => op.state === 'complete'), true)
})

test('conflicting, invalid and unsaved survivor changes never unlock knowledge', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  data.savePerson(folder, person)
  person.knowledge = [knowledge('Unsaved')]
  assert.throws(() => data.savePerson(folder, person), data.ConflictError)
  person.schemaVersion = 99
  assert.throws(() => data.savePerson(folder, person))
  assert.deepEqual(data.getSettlementRecord(folder).knowledges, [])
})

test('bootstrap uses existing valid saved survivors and never creates a missing folder', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Existing')
  person.tenetKnowledge = [knowledge()]
  fs.writeFileSync(path.join(folder, 'existing.json'), JSON.stringify(person))
  fs.writeFileSync(path.join(folder, 'broken.json'), '{')
  assert.equal(data.getSettlementRecord(folder).knowledges.length, 1)
  assert.throws(() => data.getSettlementRecord(path.join(folder, 'missing')), /existing Survivors folder/)
  assert.equal(fs.existsSync(path.join(folder, 'missing')), false)
})

test('settlement files are excluded and protected from survivor CRUD; malformed records are not replaced', t => {
  const folder = setup(t)
  data.getSettlementRecord(folder)
  for (const file of ['settlement.json', 'settlement-journal.json']) {
    assert.throws(() => data.loadPerson(folder, file), /Reserved/)
    assert.throws(() => data.deletePerson(folder, file), /Reserved/)
    assert.throws(() => data.savePerson(folder, data.createPersonTemplate('Alice'), { expectedFileName: file }), /Reserved/)
  }
  fs.writeFileSync(path.join(folder, 'settlement.json'), 'null')
  assert.throws(() => data.getSettlementRecord(folder), /Invalid settlement record/)
  assert.equal(fs.readFileSync(path.join(folder, 'settlement.json'), 'utf8'), 'null')
})

test('failed settlement write stays queued after survivor commit, then retries idempotently', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  const rename = fs.renameSync
  const mock = t.mock.method(fs, 'renameSync', (source, target) => {
    if (target === path.join(folder, 'settlement.json')) throw new Error('Disk unavailable')
    return rename(source, target)
  })
  const file = data.savePerson(folder, person)
  assert.equal(data.loadPerson(folder, file).revision, 1)
  assert.match(data.getSettlementWarning(folder), /pending recovery/)
  let log = read(folder, 'settlement-journal.json')
  assert.equal(log.operations[0].state, 'committed')
  assert.ok(log.events.some(event => event.outcome === 'failed' && event.detail === 'Disk unavailable'))
  mock.mock.restore()
  assert.equal(data.getSettlementRecord(folder).knowledges.length, 1)
  assert.equal(data.getSettlementRecord(folder).knowledges.length, 1)
  assert.equal(data.getSettlementWarning(folder), null)
  assert.equal(data.loadPerson(folder, file).revision, 1)
  log = read(folder, 'settlement-journal.json')
  assert.equal(log.operations[0].state, 'complete')
  assert.deepEqual(log.events.map(event => event.sequence), log.events.map((_, index) => index + 1))
})

test('recovery recognizes a committed survivor when the commit receipt was interrupted', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  const file = `${person.id}_alice.json`
  settlement.prepare(folder, file, person)
  fs.writeFileSync(path.join(folder, file), JSON.stringify(person))
  assert.equal(data.getSettlementRecord(folder).knowledges.length, 1)
  assert.equal(read(folder, 'settlement-journal.json').operations[0].state, 'complete')
  assert.equal(data.getSettlementRecord(folder).knowledges.length, 1)
})

test('recovery cancels an interrupted save that never reached disk', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  settlement.prepare(folder, `${person.id}_alice.json`, person)
  assert.deepEqual(data.getSettlementRecord(folder).knowledges, [])
  assert.equal(read(folder, 'settlement-journal.json').operations[0].state, 'cancelled')
})

test('crash after settlement write but before queue completion does not duplicate unlocks', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  data.savePerson(folder, person)
  const log = read(folder, 'settlement-journal.json')
  log.operations[0].state = 'committed'
  fs.writeFileSync(path.join(folder, 'settlement-journal.json'), JSON.stringify(log))
  const before = read(folder, 'settlement.json')
  const after = data.getSettlementRecord(folder)
  assert.equal(after.knowledges.length, 1)
  assert.equal(after.revision, before.revision)
  assert.equal(after.knowledges[0].id, before.knowledges[0].id)
})

test('a failed survivor write is logged and never registers its knowledge', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  const rename = fs.renameSync
  const mock = t.mock.method(fs, 'renameSync', (source, target) => {
    if (path.basename(target).startsWith(person.id)) throw new Error('Survivor write failed')
    return rename(source, target)
  })
  assert.throws(() => data.savePerson(folder, person), /Survivor write failed/)
  mock.mock.restore()
  const log = read(folder, 'settlement-journal.json')
  assert.equal(log.operations[0].state, 'cancelled')
  assert.ok(log.events.some(event => event.outcome === 'failed' && event.detail === 'Survivor write failed'))
  assert.deepEqual(data.getSettlementRecord(folder).knowledges, [])
})

test('an unwritable or malformed journal blocks the survivor write', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  const rename = fs.renameSync
  const mock = t.mock.method(fs, 'renameSync', (source, target) => {
    if (target === path.join(folder, 'settlement-journal.json')) throw new Error('Journal unavailable')
    return rename(source, target)
  })
  assert.throws(() => data.savePerson(folder, person), /Journal unavailable/)
  assert.deepEqual(data.listPeople(folder), [])
  mock.mock.restore()
  fs.writeFileSync(path.join(folder, 'settlement-journal.json'), 'null')
  assert.throws(() => data.savePerson(folder, person), /Invalid settlement journal/)
  assert.deepEqual(data.listPeople(folder), [])
})

test('actual survivor save recovers when its commit receipt cannot be written', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  const rename = fs.renameSync
  let journalWrites = 0
  const mock = t.mock.method(fs, 'renameSync', (source, target) => {
    if (target === path.join(folder, 'settlement-journal.json') && ++journalWrites === 2) throw new Error('Receipt interrupted')
    return rename(source, target)
  })
  t.mock.method(console, 'warn', () => {})
  const file = data.savePerson(folder, person)
  assert.equal(read(folder, 'settlement-journal.json').operations[0].state, 'prepared')
  mock.mock.restore()
  const saved = data.loadPerson(folder, file)
  saved.knowledge = []
  data.savePerson(folder, saved)
  assert.equal(data.getSettlementRecord(folder).knowledges.length, 1)
  assert.equal(data.loadPerson(folder, file).revision, 2)
})

test('settlement name saves preserve discoveries and reject stale or foreign records', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Alice')
  person.knowledge = [knowledge()]
  data.savePerson(folder, person)
  const original = data.getSettlementRecord(folder)
  const saved = data.saveSettlementName(folder, { ...original, name: '  Lantern Home  ', knowledges: [] })
  assert.equal(saved.name, 'Lantern Home')
  assert.equal(saved.revision, original.revision + 1)
  assert.deepEqual(saved.knowledges, original.knowledges)
  assert.equal(saved.createdAt, original.createdAt)
  assert.equal(data.getSettlementRecord(folder).name, 'Lantern Home')
  assert.throws(() => data.saveSettlementName(folder, { ...original, name: 'Stale' }), data.ConflictError)
  assert.throws(() => data.saveSettlementName(folder, { ...saved, id: 'other', name: 'Wrong' }), data.ConflictError)
  assert.throws(() => data.saveSettlementName(folder, { ...saved, name: 'x'.repeat(201) }), data.ValidationError)
  assert.equal(read(folder, 'settlement.json').pendingOperations, undefined)
})

test('settlement type locks after its first settings save while the name remains editable', t => {
  const folder = setup(t)
  const original = data.getSettlementRecord(folder)
  assert.equal(original.settlementType, 'campaign')
  assert.equal(original.settlementTypeLocked, false)

  const saved = data.saveSettlementSettings(folder, {
    id: original.id,
    revision: original.revision,
    name: 'Lantern Home',
    settlementType: 'campaign',
    lanternYear: 3
  })
  assert.equal(saved.settlementTypeLocked, true)
  assert.equal(saved.lanternYear, 3)
  assert.throws(() => data.saveSettlementSettings(folder, {
    id: saved.id,
    revision: saved.revision,
    name: saved.name,
    settlementType: 'vignette',
    lanternYear: 3
  }), error => error instanceof data.ValidationError && /cannot be changed/.test(error.message))

  const renamed = data.saveSettlementSettings(folder, {
    id: saved.id,
    revision: saved.revision,
    name: 'New Lantern Home',
    settlementType: 'campaign',
    lanternYear: 4
  })
  assert.equal(renamed.name, 'New Lantern Home')
  assert.equal(renamed.settlementType, 'campaign')
  assert.equal(renamed.settlementTypeLocked, true)
  assert.equal(renamed.lanternYear, 4)
  assert.throws(() => data.saveSettlementSettings(folder, {
    id: renamed.id,
    revision: renamed.revision,
    name: renamed.name,
    settlementType: 'campaign',
    lanternYear: -1
  }), error => error instanceof data.ValidationError && /Lantern Year/.test(error.message))
})

test('LAN campaign returns record survivor, year, time and life status exactly once', t => {
  const folder = setup(t)
  let record = data.getSettlementRecord(folder)
  record = data.saveSettlementSettings(folder, {
    id: record.id,
    revision: record.revision,
    name: 'Lantern Home',
    settlementType: 'campaign',
    lanternYear: 7
  })
  const person = data.createPersonTemplate('Alice')
  const file = data.savePerson(folder, person)
  assert.deepEqual(data.getSettlementRecord(folder).returns, [])

  const returning = data.loadPerson(folder, file)
  returning.isAlive = false
  data.savePerson(folder, returning, {
    expectedFileName: file,
    markReturned: true,
    recordSettlementReturn: true
  })
  const afterReturn = data.getSettlementRecord(folder)
  assert.equal(afterReturn.returns.length, 1)
  assert.equal(afterReturn.returns[0].survivorId, person.id)
  assert.equal(afterReturn.returns[0].survivorName, 'Alice')
  assert.equal(afterReturn.returns[0].lanternYear, 7)
  assert.equal(afterReturn.returns[0].isAlive, false)
  assert.equal(Number.isNaN(Date.parse(afterReturn.returns[0].returnedAt)), false)

  const log = read(folder, 'settlement-journal.json')
  log.operations.at(-1).state = 'committed'
  fs.writeFileSync(path.join(folder, 'settlement-journal.json'), JSON.stringify(log), 'utf8')
  assert.equal(data.getSettlementRecord(folder).returns.length, 1)
})

test('local-style returns do not add settlement return history', t => {
  const folder = setup(t)
  const person = data.createPersonTemplate('Local Alice')
  const file = data.savePerson(folder, person)
  const returning = data.loadPerson(folder, file)
  data.savePerson(folder, returning, { expectedFileName: file, markReturned: true })
  assert.deepEqual(data.getSettlementRecord(folder).returns, [])
})

test('legacy vignette records are inferred as locked', t => {
  const folder = setup(t)
  data.getSettlementRecord(folder)
  const file = path.join(folder, 'settlement.json')
  const legacy = JSON.parse(fs.readFileSync(file, 'utf8'))
  legacy.settlementType = 'vignette'
  delete legacy.settlementTypeLocked
  fs.writeFileSync(file, JSON.stringify(legacy, null, 2), 'utf8')

  const loaded = data.getSettlementRecord(folder)
  assert.equal(loaded.settlementType, 'vignette')
  assert.equal(loaded.settlementTypeLocked, true)
})

test('vignette template restore replaces survivor files from saved template and keeps a backup', t => {
  const folder = setup(t)
  const alice = data.createPersonTemplate('Alice')
  alice.knowledge = [knowledge('Founding Stone')]
  const bob = data.createPersonTemplate('Bob')
  const aliceFile = data.savePerson(folder, alice)
  const bobFile = data.savePerson(folder, bob)

  let record = data.getSettlementRecord(folder)
  record = data.saveSettlementSettings(folder, {
    id: record.id,
    revision: record.revision,
    name: 'Lantern Home',
    settlementType: 'vignette'
  })
  assert.equal(record.settlementTypeLocked, true)
  record = data.saveSettlementVignetteTemplate(folder, {
    id: record.id,
    revision: record.revision,
    name: record.name,
    settlementType: record.settlementType
  })
  assert.equal(record.settlementType, 'vignette')
  assert.equal(record.vignetteTemplate.survivors.length, 2)

  const changedAlice = data.loadPerson(folder, aliceFile)
  changedAlice.name = 'Alice Changed'
  changedAlice.survivalPts = 8
  data.savePerson(folder, changedAlice, { expectedFileName: aliceFile })
  data.savePerson(folder, data.createPersonTemplate('Charlie'))

  const restore = data.restoreSettlementVignetteTemplate(folder, {
    id: record.id,
    revision: data.getSettlementRecord(folder).revision,
    name: record.name,
    settlementType: 'vignette'
  })
  assert.equal(restore.restoredCount, 2)
  assert.deepEqual(data.listPeople(folder), [aliceFile, bobFile].sort((a, b) => a.localeCompare(b)))
  assert.equal(data.loadPerson(folder, aliceFile).name, 'Alice')
  assert.equal(data.loadPerson(folder, aliceFile).survivalPts, 0)
  assert.equal(data.getSettlementRecord(folder).knowledges.length, 1)

  const backupPath = path.join(folder, restore.backupPath)
  const backupSurvivors = fs.readdirSync(backupPath).map(fileName => JSON.parse(fs.readFileSync(path.join(backupPath, fileName), 'utf8')))
  assert.equal(backupSurvivors.some(person => person.name === 'Alice Changed'), true)
  assert.equal(fs.readdirSync(backupPath).some(fileName => fileName.includes('charlie')), true)
})
