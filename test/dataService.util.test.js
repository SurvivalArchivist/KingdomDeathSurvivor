/**
 * Comprehensive tests for dataService public API
 * Tests through the public exported functions
 */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')

const dataService = require('../src/dataService')

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-util-test-'))
}

function makeApp(userDataPath) {
  return {
    getPath(name) {
      if (name !== 'userData') throw new Error(`Unexpected app path request: ${name}`)
      return userDataPath
    }
  }
}

test('createPersonTemplate generates valid default template', () => {
  const template = dataService.createPersonTemplate('New Survivor')

  // Required fields exist
  assert.equal(template.name, 'New Survivor')
  assert.equal(template.schemaVersion, 3)
  assert.equal(template.revision, 0)
  assert.equal(template.gender, 'M')
  assert.equal(template.age, 0)
  assert.equal(template.isAlive, true)
  assert.equal(template.movement, 5)

  // Array fields
  assert.deepEqual(template.abilities, [])
  assert.deepEqual(template.impairments, [])
  assert.deepEqual(template.notes, [])
  assert.deepEqual(template.fightingArts, [])
  assert.deepEqual(template.secretFightingArts, [])
  assert.deepEqual(template.disorders, [])
  assert.deepEqual(template.tenetKnowledge, [])
  assert.deepEqual(template.knowledge, [])

  // Weapon proficiency structure
  assert.deepEqual(template.weaponProficiency, {
    type: '',
    level: 0,
    isSpecialist: false,
    isMaster: false
  })

  // Default name when called with no args
  const defaultTemplate = dataService.createPersonTemplate()
  assert.equal(defaultTemplate.name, 'New Survivor')
})

test('createPersonTemplate creates template with custom name', () => {
  const template = dataService.createPersonTemplate('Alice')
  assert.equal(template.name, 'Alice')

  const template2 = dataService.createPersonTemplate('Bob Smith')
  assert.equal(template2.name, 'Bob Smith')
})

test('savePerson generates correct filename from name', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Alice')
  const fileName = dataService.savePerson(basePath, person)
  assert.equal(fileName, 'alice.json')

  const person2 = dataService.createPersonTemplate('Bob Smith')
  const fileName2 = dataService.savePerson(basePath, person2)
  assert.equal(fileName2, 'bob-smith.json')
})

test('savePerson generates filename with special characters', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate("Alice O'Brien")
  const fileName = dataService.savePerson(basePath, person)
  // Apostrophe is replaced with dash in slugify
  assert.equal(fileName, 'alice-o-brien.json')
})

test('listPeople returns empty array for missing directory', () => {
  const result = dataService.listPeople('/nonexistent/path')
  assert.deepEqual(result, [])
})

test('listPeople returns sorted JSON files only', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'survivors')
  fs.mkdirSync(basePath, { recursive: true })

  // Create various files
  fs.writeFileSync(path.join(basePath, 'zara.json'), '{}')
  fs.writeFileSync(path.join(basePath, 'alice.json'), '{}')
  fs.writeFileSync(path.join(basePath, 'bob.json'), '{}')
  fs.writeFileSync(path.join(basePath, 'notes.txt'), 'not a person')
  fs.writeFileSync(path.join(basePath, 'data.json.bak'), '{}')

  const result = dataService.listPeople(basePath)

  // Should only include .json files, sorted
  assert.deepEqual(result, ['alice.json', 'bob.json', 'zara.json'])
})

test('listPeople ignores subdirectories', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'survivors')
  fs.mkdirSync(path.join(basePath, 'subdir'), { recursive: true })

  fs.writeFileSync(path.join(basePath, 'main.json'), '{}')
  fs.writeFileSync(path.join(basePath, 'subdir', 'nested.json'), '{}')

  const result = dataService.listPeople(basePath)
  assert.deepEqual(result, ['main.json'])
})

test('listPeople sorts alphabetically', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'survivors')
  fs.mkdirSync(basePath, { recursive: true })

  fs.writeFileSync(path.join(basePath, 'zebra.json'), '{}')
  fs.writeFileSync(path.join(basePath, 'alpha.json'), '{}')
  fs.writeFileSync(path.join(basePath, 'middle.json'), '{}')

  const result = dataService.listPeople(basePath)
  assert.deepEqual(result, ['alpha.json', 'middle.json', 'zebra.json'])
})

test('loadPerson and deletePerson validate filename', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  // Invalid filenames should throw
  assert.throws(
    () => dataService.loadPerson(basePath, 'not-json.txt'),
    /Invalid person filename/
  )
  assert.throws(
    () => dataService.deletePerson(basePath, 'not-json.txt'),
    /Invalid person filename/
  )

  assert.throws(
    () => dataService.loadPerson(basePath, ''),
    /Invalid person filename/
  )
  assert.throws(
    () => dataService.deletePerson(basePath, ''),
    /Invalid person filename/
  )

  assert.throws(
    () => dataService.loadPerson(basePath, null),
    /Invalid person filename/
  )
  assert.throws(
    () => dataService.deletePerson(basePath, null),
    /Invalid person filename/
  )
})

test('loadPerson throws for missing file', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  assert.throws(
    () => dataService.loadPerson(basePath, 'missing.json'),
    /Person file not found/
  )
})

test('deletePerson throws for missing file', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  assert.throws(
    () => dataService.deletePerson(basePath, 'missing.json'),
    /Person file not found/
  )
})

test('normalizeDataSources handles legacy single path string', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  const dataPath = '/path/to/survivors'

  dataService.saveConfig(app, dataPath)

  const sources = dataService.getSavedDataSources(app)
  assert.equal(sources.survivors, dataPath)
  assert.equal(sources.fightingArts, '')
  assert.equal(sources.secretFightingArts, '')
  assert.equal(sources.knowledges, '')
})

test('getSavedDataSources returns all SOURCE_KEYS', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  const sources = dataService.getSavedDataSources(app)

  for (const key of dataService.SOURCE_KEYS) {
    assert.ok(key in sources, `Missing key: ${key}`)
  }
})

test('normalizeAppSettings handles username trimming', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  const saved = dataService.saveAppSettings(app, { userName: '  Mike  ', dateFormat: 'en-US' })
  assert.equal(saved.userName, 'Mike')
  assert.equal(saved.dateFormat, 'en-US')

  const loaded = dataService.getSavedAppSettings(app)
  assert.equal(loaded.userName, 'Mike')
  assert.equal(loaded.dateFormat, 'en-US')
})

test('normalizeAppSettings handles empty username', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  const saved = dataService.saveAppSettings(app, { userName: '' })
  assert.equal(saved.userName, '')
  assert.equal(saved.dateFormat, 'en-GB')

  const loaded = dataService.getSavedAppSettings(app)
  assert.equal(loaded.userName, '')
  assert.equal(loaded.dateFormat, 'en-GB')
})

test('normalizeAppSettings falls back to british date format for invalid input', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  const saved = dataService.saveAppSettings(app, { userName: 'Mike', dateFormat: 'iso' })
  assert.equal(saved.userName, 'Mike')
  assert.equal(saved.dateFormat, 'en-GB')

  const loaded = dataService.getSavedAppSettings(app)
  assert.equal(loaded.dateFormat, 'en-GB')
})

test('saveConfig and getSavedDataSources roundtrip', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  const sources = {
    survivors: '/path/to/survivors',
    defaultSurvivorTemplates: '/path/to/templates',
    fightingArts: '/path/to/arts',
    secretFightingArts: '/path/to/secret',
    knowledges: '/path/to/knowledges',
    tenetKnowledges: '/path/to/tenets',
    neuroses: '/path/to/neuroses',
    disorders: '/path/to/disorders'
  }

  dataService.saveConfig(app, sources)

  const loaded = dataService.getSavedDataSources(app)
  assert.equal(loaded.survivors, sources.survivors)
  assert.equal(loaded.defaultSurvivorTemplates, sources.defaultSurvivorTemplates)
  assert.equal(loaded.fightingArts, sources.fightingArts)
})

test('setDataSource validates source key', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  assert.throws(
    () => dataService.setDataSource(app, 'invalid-key', '/path'),
    /Invalid data source key/
  )
})

test('setDataSource validates folder path', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  assert.throws(
    () => dataService.setDataSource(app, 'survivors', ''),
    /Invalid folder path/
  )
  assert.throws(
    () => dataService.setDataSource(app, 'survivors', '   '),
    /Invalid folder path/
  )
})

test('setDataSource trims whitespace from path', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  const result = dataService.setDataSource(app, 'survivors', '  /path/to/survivors  ')
  assert.equal(result.survivors, '/path/to/survivors')
})

test('getSavedDataFolder returns survivors path', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  const dataPath = '/path/to/survivors'

  dataService.saveConfig(app, dataPath)

  const folder = dataService.getSavedDataFolder(app)
  assert.equal(folder, dataPath)
})

test('ensureDataFolderConfigured throws without config', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)

  assert.throws(
    () => dataService.ensureDataFolderConfigured(app),
    /No data folder selected/
  )
})

test('ensureDataFolderConfigured returns path when configured', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  const dataPath = '/path/to/survivors'

  dataService.saveConfig(app, dataPath)

  const folder = dataService.ensureDataFolderConfigured(app)
  assert.equal(folder, dataPath)
})

test('savePerson persists and loads person correctly', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test Survivor')
  person.age = 5
  person.philosophy = 'Test Philosophy'

  const fileName = dataService.savePerson(basePath, person)
  const loaded = dataService.loadPerson(basePath, fileName)

  assert.equal(loaded.name, 'Test Survivor')
  assert.equal(loaded.age, 5)
  assert.equal(loaded.philosophy, 'Test Philosophy')
  assert.equal(loaded.schemaVersion, 3)
})

test('savePerson throws ValidationError for invalid data', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const invalidPerson = { name: 'Invalid' }

  assert.throws(
    () => dataService.savePerson(basePath, invalidPerson),
    err => {
      assert.equal(err instanceof dataService.ValidationError, true)
      assert.ok(Array.isArray(err.validationErrors))
      assert.ok(err.validationErrors.length > 0)
      return true
    }
  )
})

test('savePerson throws ConflictError for stale revision', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Conflict Test')
  const fileName = dataService.savePerson(basePath, person)

  const sessionA = dataService.loadPerson(basePath, fileName)
  const sessionB = dataService.loadPerson(basePath, fileName)

  sessionA.philosophy = 'A changes'
  dataService.savePerson(basePath, sessionA)

  sessionB.philosophy = 'B stale changes'
  assert.throws(
    () => dataService.savePerson(basePath, sessionB),
    err => err instanceof dataService.ConflictError
  )
})

test('ValidationError contains structured errors', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const invalidPerson = { name: '' }

  try {
    dataService.savePerson(basePath, invalidPerson)
    assert.fail('Should have thrown')
  } catch (err) {
    assert.equal(err instanceof dataService.ValidationError, true)
    assert.ok(Array.isArray(err.validationErrors))
    assert.ok(err.validationErrors.length > 0)

    // Check structure of first error
    const firstError = err.validationErrors[0]
    assert.ok('path' in firstError)
    assert.ok('message' in firstError)
    assert.ok('keyword' in firstError)
  }
})

test('ConflictError is correctly identified', () => {
  const error = new dataService.ConflictError('Test conflict')
  assert.equal(error.name, 'ConflictError')
  assert.equal(error instanceof Error, true)
})

test('ValidationError is correctly identified', () => {
  const error = new dataService.ValidationError('Test error', [])
  assert.equal(error.name, 'ValidationError')
  assert.equal(error instanceof Error, true)
  assert.deepEqual(error.validationErrors, [])
})
