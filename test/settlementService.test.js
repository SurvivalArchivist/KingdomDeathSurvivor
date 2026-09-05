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
