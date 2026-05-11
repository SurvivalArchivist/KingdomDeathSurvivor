/**
 * Comprehensive tests for schema compatibility and migration functions
 * These tests work by testing the public API (savePerson/loadPerson)
 */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')

const dataService = require('../src/dataService')

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-schema-test-'))
}

test('loadPerson handles schema version 0 (legacy) by migrating', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  // Create a person with schemaVersion 0 (legacy)
  const legacyPerson = dataService.createPersonTemplate('Legacy Survivor')
  legacyPerson.schemaVersion = 0
  // Remove properties that would be auto-populated
  delete legacyPerson.notes
  delete legacyPerson.createdAt
  delete legacyPerson.lastUpdated
  delete legacyPerson.lastReturned
  delete legacyPerson.editedBy

  const filePath = path.join(basePath, 'legacy.json')
  fs.writeFileSync(filePath, JSON.stringify(legacyPerson), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'legacy.json')

  // Schema version should be migrated
  assert.equal(loaded.schemaVersion, 5)

  // Missing fields should be populated
  assert.deepEqual(loaded.notes, [])
  assert.equal(typeof loaded.createdAt, 'string')
  assert.equal(loaded.createdAt, loaded.updatedAt)
  assert.equal(typeof loaded.lastUpdated, 'string')
  assert.equal(loaded.lastUpdated, loaded.updatedAt)
  assert.equal(loaded.lastReturned, null)
  assert.equal(loaded.editedBy, '')

  // Fields that existed should be preserved
  assert.equal(loaded.name, 'Legacy Survivor')
})

test('loadPerson handles schema version 1 by migrating', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const v1Person = dataService.createPersonTemplate('V1 Survivor')
  v1Person.schemaVersion = 1
  // Remove notes to test migration adds it
  delete v1Person.notes

  const filePath = path.join(basePath, 'v1.json')
  fs.writeFileSync(filePath, JSON.stringify(v1Person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'v1.json')

  assert.equal(loaded.schemaVersion, 5)
  assert.deepEqual(loaded.notes, [])
})

test('loadPerson handles schema version 2 by migrating', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const v2Person = dataService.createPersonTemplate('V2 Survivor')
  v2Person.schemaVersion = 2

  const filePath = path.join(basePath, 'v2.json')
  fs.writeFileSync(filePath, JSON.stringify(v2Person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'v2.json')

  assert.equal(loaded.schemaVersion, 5)
})

test('loadPerson handles schema version at boundary (current version)', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  // Test CURRENT_PERSON_SCHEMA_VERSION (3) - should pass through
  const currentPerson = dataService.createPersonTemplate('Current Survivor')

  const filePath = path.join(basePath, 'current.json')
  fs.writeFileSync(filePath, JSON.stringify(currentPerson), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'current.json')
  assert.equal(loaded.schemaVersion, 5)
})

test('loadPerson rejects unsupported future schema', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const futurePerson = dataService.createPersonTemplate('Future Survivor')
  futurePerson.schemaVersion = 6 // One above current

  const filePath = path.join(basePath, 'future.json')
  fs.writeFileSync(filePath, JSON.stringify(futurePerson), 'utf8')

  assert.throws(
    () => dataService.loadPerson(basePath, 'future.json'),
    err => {
      assert.equal(err instanceof dataService.ValidationError, true)
      assert.ok(err.message.includes('Unsupported person schemaVersion'))
      assert.ok(err.message.includes('6'))
      return true
    }
  )
})

test('loadPerson rejects very future schema version', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const futurePerson = dataService.createPersonTemplate('Far Future Survivor')
  futurePerson.schemaVersion = 999

  const filePath = path.join(basePath, 'far-future.json')
  fs.writeFileSync(filePath, JSON.stringify(futurePerson), 'utf8')

  assert.throws(
    () => dataService.loadPerson(basePath, 'far-future.json'),
    err => {
      assert.equal(err instanceof dataService.ValidationError, true)
      return true
    }
  )
})

test('loadPerson preserves all existing fields during schema migration', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('Full Survivor')
  person.schemaVersion = 0
  person.age = 5
  person.philosophy = 'Test Philosophy'
  person.lumi = 10
  person.fightingArts = [{ name: 'Art 1', file: 'art1.md' }]
  person.abilities = ['Ability 1', 'Ability 2']

  const filePath = path.join(basePath, 'full.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'full.json')

  assert.equal(loaded.age, 5)
  assert.equal(loaded.philosophy, 'Test Philosophy')
  assert.equal(loaded.lumi, 10)
  assert.deepEqual(loaded.fightingArts, [{ name: 'Art 1', file: 'art1.md' }])
  assert.deepEqual(loaded.abilities, ['Ability 1', 'Ability 2'])
})

test('loadPerson migrates updatedAt to lastUpdated', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('UpdatedAt Test')
  person.schemaVersion = 0
  person.updatedAt = '2023-01-15T10:30:00.000Z'
  delete person.lastUpdated

  const filePath = path.join(basePath, 'updated-at.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'updated-at.json')

  assert.equal(loaded.lastUpdated, '2023-01-15T10:30:00.000Z')
})

test('loadPerson migrates missing createdAt from existing timestamps', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('CreatedAt Test')
  person.schemaVersion = 0
  person.updatedAt = '2023-02-03T04:05:06.000Z'
  person.lastUpdated = '2023-03-04T05:06:07.000Z'
  delete person.createdAt

  const filePath = path.join(basePath, 'created-at.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'created-at.json')
  assert.equal(loaded.createdAt, '2023-02-03T04:05:06.000Z')
})

test('loadPerson handles legacy lastReturned values', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  // Test with null (should remain null)
  let person = dataService.createPersonTemplate('Null LastReturned')
  person.schemaVersion = 0
  person.lastReturned = null
  let filePath = path.join(basePath, 'null-lastreturned.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  let loaded = dataService.loadPerson(basePath, 'null-lastreturned.json')
  assert.equal(loaded.lastReturned, null)

  // Test with string timestamp (should be preserved)
  person = dataService.createPersonTemplate('String LastReturned')
  person.schemaVersion = 0
  person.lastReturned = '2023-01-15T10:30:00.000Z'
  filePath = path.join(basePath, 'string-lastreturned.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  loaded = dataService.loadPerson(basePath, 'string-lastreturned.json')
  assert.equal(loaded.lastReturned, '2023-01-15T10:30:00.000Z')
})

test('loadPerson sanitizes legacy knowledge entry metadata before validation', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('Legacy Knowledge Survivor')
  person.tenetKnowledge = [
    {
      title: 'Abyssal Oath',
      fileName: 'abyssal-oath.md',
      observations: 2,
      extraNote: 'legacy field',
      template: {
        observation: 'Watch the void.',
        rules: 'Once per showdown.',
        observationRequirement: 3,
        knowledgeLevel: 2,
        nextKnowledgeMode: 'existingTemplate',
        nextKnowledgeTemplate: 'abyssal-oath-2.json'
      }
    }
  ]
  person.knowledge = [
    {
      name: 'Lantern Lore',
      fileName: 'lantern-lore.md',
      observation: 'Study the lantern.',
      rules: 'Gain +1 understanding.',
      observations: 1,
      observationRequirement: 4,
      knowledgeLevel: 2,
      nextKnowledgeMode: 'noTemplate',
      extra: true
    },
    {
      title: 'Bone Smith',
      template: {
        observation: 'Catalog the fractures.',
        rules: 'Craft with confidence.',
        observationRequirement: 5,
        knowledgeLevel: 3,
        nextKnowledgeMode: 'maxLevel'
      },
      templateCategory: 'knowledges'
    }
  ]

  const filePath = path.join(basePath, 'legacy-knowledge.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'legacy-knowledge.json')

  assert.deepEqual(loaded.tenetKnowledge[0], {
    name: 'Abyssal Oath',
    observation: 'Watch the void.',
    rules: 'Once per showdown.',
    observationRequirement: 3,
    currentObservations: 2,
    knowledgeLevel: 2,
    nextKnowledgeMode: 'existingTemplate',
    nextKnowledgeTemplate: 'abyssal-oath-2.json',
    file: 'abyssal-oath.md'
  })
  assert.deepEqual(loaded.knowledge[0], {
    name: 'Lantern Lore',
    observation: 'Study the lantern.',
    rules: 'Gain +1 understanding.',
    observationRequirement: 4,
    currentObservations: 1,
    knowledgeLevel: 2,
    nextKnowledgeMode: 'noTemplate',
    file: 'lantern-lore.md'
  })
  assert.deepEqual(loaded.knowledge[1], {
    name: 'Bone Smith',
    observation: 'Catalog the fractures.',
    rules: 'Craft with confidence.',
    observationRequirement: 5,
    knowledgeLevel: 3,
    nextKnowledgeMode: 'maxLevel'
  })
})

test('loadPerson auto-populates missing notes array', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('No Notes')
  person.schemaVersion = 0
  delete person.notes

  const filePath = path.join(basePath, 'no-notes.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'no-notes.json')

  assert.deepEqual(loaded.notes, [])
})

test('loadPerson auto-populates editedBy when missing', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('No Editor')
  person.schemaVersion = 0
  delete person.editedBy

  const filePath = path.join(basePath, 'no-editor.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'no-editor.json')

  assert.equal(loaded.editedBy, '')
})

test('loadPerson handles missing schemaVersion entirely (defaults to 0)', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('No Schema Version')
  delete person.schemaVersion

  const filePath = path.join(basePath, 'no-schema.json')
  fs.writeFileSync(filePath, JSON.stringify(person), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'no-schema.json')

  // Should be migrated to current version
  assert.equal(loaded.schemaVersion, 5)
})

test('savePerson increments revision correctly on each save', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Revision Test')
  const fileName = dataService.savePerson(basePath, person)

  let loaded = dataService.loadPerson(basePath, fileName)
  assert.equal(loaded.revision, 1)

  loaded.age = 1
  const fileName2 = dataService.savePerson(basePath, loaded)
  assert.equal(fileName2, fileName)

  loaded = dataService.loadPerson(basePath, fileName)
  assert.equal(loaded.revision, 2)

  loaded.age = 2
  const fileName3 = dataService.savePerson(basePath, loaded)
  assert.equal(fileName3, fileName)

  loaded = dataService.loadPerson(basePath, fileName)
  assert.equal(loaded.revision, 3)
})

test('savePerson sets updatedAt and lastUpdated on each save while preserving createdAt', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Timestamp Test')
  const fileName = dataService.savePerson(basePath, person)

  const loaded = dataService.loadPerson(basePath, fileName)

  assert.equal(typeof loaded.createdAt, 'string')
  assert.equal(typeof loaded.updatedAt, 'string')
  assert.equal(typeof loaded.lastUpdated, 'string')
  assert.equal(loaded.updatedAt, loaded.lastUpdated)
  assert.equal(loaded.createdAt, person.createdAt)

  // Both should be valid ISO timestamps
  const updatedAtDate = new Date(loaded.updatedAt)
  assert.ok(!Number.isNaN(updatedAtDate.getTime()))

  loaded.age = 1
  const secondFileName = dataService.savePerson(basePath, loaded)
  const second = dataService.loadPerson(basePath, secondFileName)
  assert.equal(second.createdAt, loaded.createdAt)
  assert.equal(second.lastUpdated, second.updatedAt)
})

test('savePerson marks lastReturned when markReturned option is true', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Mark Returned Test')
  const fileName = dataService.savePerson(basePath, person, { markReturned: true })

  const loaded = dataService.loadPerson(basePath, fileName)

  assert.equal(typeof loaded.lastReturned, 'string')
  assert.ok(loaded.lastReturned.length > 0)

  // Should be a valid ISO timestamp
  const lastReturnedDate = new Date(loaded.lastReturned)
  assert.ok(!Number.isNaN(lastReturnedDate.getTime()))
})

test('savePerson sets editedBy from editorName option', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Editor Test')
  const fileName = dataService.savePerson(basePath, person, { editorName: 'Test Archivist' })

  const loaded = dataService.loadPerson(basePath, fileName)

  assert.equal(loaded.editedBy, 'Test Archivist')
})

test('savePerson preserves existing lastReturned when not marking returned', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Preserve Returned')
  const fileName = dataService.savePerson(basePath, person, { markReturned: true })

  let loaded = dataService.loadPerson(basePath, fileName)
  const originalLastReturned = loaded.lastReturned

  // Wait a tiny bit to ensure timestamp would differ
  loaded.age = 1
  dataService.savePerson(basePath, loaded, { markReturned: false })

  loaded = dataService.loadPerson(basePath, fileName)
  // lastReturned should be preserved (not updated)
  assert.equal(loaded.lastReturned, originalLastReturned)
})
