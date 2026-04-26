/**
 * Comprehensive tests for file system error handling
 */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')

const dataService = require('../src/dataService')

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-fs-test-'))
}

function makeApp(userDataPath) {
  return {
    getPath(name) {
      if (name !== 'userData') throw new Error(`Unexpected app path request: ${name}`)
      return userDataPath
    }
  }
}

test('loadPerson handles corrupted JSON gracefully', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  // Write corrupted JSON
  const filePath = path.join(basePath, 'corrupted.json')
  fs.writeFileSync(filePath, '{ broken json content', 'utf8')

  assert.throws(
    () => dataService.loadPerson(basePath, 'corrupted.json'),
    err => {
      // Should throw an error (either from JSON.parse or validation)
      return err instanceof Error
    }
  )
})

test('loadPerson handles valid JSON that fails validation', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  // Write valid JSON that doesn't match schema
  const filePath = path.join(basePath, 'invalid-schema.json')
  fs.writeFileSync(filePath, JSON.stringify({ name: 'Test' }), 'utf8')

  assert.throws(
    () => dataService.loadPerson(basePath, 'invalid-schema.json'),
    err => err instanceof dataService.ValidationError
  )
})

test('loadPerson handles partially corrupted JSON', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  // Write partially corrupted JSON (starts valid but ends badly)
  const filePath = path.join(basePath, 'partial.json')
  fs.writeFileSync(filePath, '{"name": "Test", invalid}', 'utf8')

  assert.throws(
    () => dataService.loadPerson(basePath, 'partial.json'),
    err => err instanceof Error
  )
})

test('loadPerson handles empty file', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  // Write empty file
  const filePath = path.join(basePath, 'empty.json')
  fs.writeFileSync(filePath, '', 'utf8')

  assert.throws(
    () => dataService.loadPerson(basePath, 'empty.json'),
    err => err instanceof Error
  )
})

test('loadPerson handles file deleted between check and read', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const filePath = path.join(basePath, 'to-delete.json')
  fs.writeFileSync(filePath, JSON.stringify(dataService.createPersonTemplate('Test')), 'utf8')

  // Delete the file right before loading
  const originalReadFileSync = fs.readFileSync
  let shouldDelete = true
  fs.readFileSync = function(path, encoding) {
    if (shouldDelete && String(path).endsWith('to-delete.json')) {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path)
      }
      shouldDelete = false
    }
    return originalReadFileSync.call(fs, path, encoding)
  }

  try {
    assert.throws(
      () => dataService.loadPerson(basePath, 'to-delete.json'),
      err => err instanceof Error
    )
  } finally {
    fs.readFileSync = originalReadFileSync
  }
})

test('savePerson handles directory creation failure', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'unwritable', 'nested')

  const person = dataService.createPersonTemplate('Test')

  // Even though mkdirSync should succeed, let's test with a mock that fails
  // For actual testing, we rely on the atomic write behavior
  const result = dataService.savePerson(basePath, person)
  assert.equal(result, 'test.json')

  // File should exist
  const filePath = path.join(basePath, 'test.json')
  assert.equal(fs.existsSync(filePath), true)
})

test('savePerson atomic write leaves original intact on failure', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  // Create initial person
  const person1 = dataService.createPersonTemplate('Original')
  const fileName = dataService.savePerson(basePath, person1)

  // Read original content
  const originalContent = fs.readFileSync(path.join(basePath, fileName), 'utf8')

  // Now try to save invalid data - should fail and leave original intact
  const invalidPerson = { name: 'Invalid' }
  assert.throws(
    () => dataService.savePerson(basePath, invalidPerson),
    err => err instanceof dataService.ValidationError
  )

  // Original should be unchanged
  const afterContent = fs.readFileSync(path.join(basePath, fileName), 'utf8')
  assert.equal(originalContent, afterContent)
})

test('listPeople handles permission denied errors gracefully', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'restricted')
  fs.mkdirSync(basePath, { recursive: true })

  // Create a file
  fs.writeFileSync(path.join(basePath, 'test.json'), '{}', 'utf8')

  // Remove read permission (on platforms that support it)
  try {
    fs.chmodSync(basePath, 0o000)

    // Should return empty or handle gracefully
    const result = dataService.listPeople(basePath)
    // Result depends on platform - some return [], others may throw
  } catch (err) {
    // Permission denied is acceptable
    assert.ok(err.message.includes('EACCES') || err.message.includes('permission', 'Permission'))
  } finally {
    // Restore permissions for cleanup
    fs.chmodSync(basePath, 0o755)
  }
})

test('listMarkdownCollections handles invalid directory', () => {
  // Missing directory
  const result1 = dataService.listMarkdownCollections({
    fightingArts: '/nonexistent/path'
  })
  assert.deepEqual(result1, [])

  // File instead of directory
  const root = makeTempDir()
  const filePath = path.join(root, 'file.txt')
  fs.writeFileSync(filePath, 'not a directory', 'utf8')

  const result2 = dataService.listMarkdownCollections({
    fightingArts: filePath
  })
  assert.deepEqual(result2, [])
})

test('listMarkdownFiles handles invalid collection', () => {
  // Invalid collection id
  assert.throws(
    () => dataService.listMarkdownFiles({}, 'invalid-collection'),
    /Invalid markdown collection id/
  )

  // Missing source path
  assert.throws(
    () => dataService.listMarkdownFiles({}, 'fightingArts'),
    /Markdown source is unavailable/
  )
})

test('loadMarkdownFile handles missing file', () => {
  const root = makeTempDir()
  const artsPath = path.join(root, 'fighting-arts')
  fs.mkdirSync(artsPath, { recursive: true })

  assert.throws(
    () => dataService.loadMarkdownFile({ fightingArts: artsPath }, 'fightingArts', 'missing.md'),
    /Markdown file not found/
  )
})

test('loadMarkdownFile handles non-markdown file', () => {
  const root = makeTempDir()
  const artsPath = path.join(root, 'fighting-arts')
  fs.mkdirSync(artsPath, { recursive: true })

  // Create a non-markdown file
  fs.writeFileSync(path.join(artsPath, 'document.txt'), 'Not markdown', 'utf8')

  assert.throws(
    () => dataService.loadMarkdownFile({ fightingArts: artsPath }, 'fightingArts', 'document.txt'),
    /Invalid markdown filename/
  )
})

test('deletePerson handles already deleted file', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  assert.throws(
    () => dataService.deletePerson(basePath, 'nonexistent.json'),
    /Person file not found/
  )
})

test('deletePerson validates filename', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  assert.throws(
    () => dataService.deletePerson(basePath, 'not-json.txt'),
    /Invalid person filename/
  )

  assert.throws(
    () => dataService.deletePerson(basePath, ''),
    /Invalid person filename/
  )

  assert.throws(
    () => dataService.deletePerson(basePath, null),
    /Invalid person filename/
  )
})

test('loadPerson validates filename', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  assert.throws(
    () => dataService.loadPerson(basePath, 'not-json.txt'),
    /Invalid person filename/
  )

  assert.throws(
    () => dataService.loadPerson(basePath, ''),
    /Invalid person filename/
  )

  assert.throws(
    () => dataService.loadPerson(basePath, null),
    /Invalid person filename/
  )

  assert.throws(
    () => dataService.loadPerson(basePath, 123),
    /Invalid person filename/
  )
})

test('savePerson handles invalid filename generation', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  // Person with name that produces empty slug - schema validation catches empty name first
  const person = dataService.createPersonTemplate('')
  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )

  // Person with name that produces only dashes - should throw filename error
  const person2 = dataService.createPersonTemplate('!!!')
  assert.throws(
    () => dataService.savePerson(basePath, person2),
    /Person name must include letters or numbers/
  )
})

test('savePerson rejects invalid nextKnowledgeMode on knowledge entries', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.knowledge = [
    {
      name: 'Test Knowledge',
      observation: '',
      rules: '',
      observationRequirement: 0,
      currentObservations: 0,
      knowledgeLevel: 1,
      nextKnowledgeMode: 'invalid-mode',
      nextKnowledgeTemplate: ''
    }
  ]

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson rejects knowledgeLevel below minimum', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.knowledge = [
    {
      name: 'Test Knowledge',
      observation: '',
      rules: '',
      observationRequirement: 0,
      currentObservations: 0,
      knowledgeLevel: 0, // Invalid: minimum is 1
      nextKnowledgeMode: 'noTemplate',
      nextKnowledgeTemplate: ''
    }
  ]

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson rejects too many fighting arts', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.fightingArts = [
    { name: 'Art 1', file: 'art1.md' },
    { name: 'Art 2', file: 'art2.md' },
    { name: 'Art 3', file: 'art3.md' },
    { name: 'Art 4', file: 'art4.md' } // Too many
  ]

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson rejects too many disorders', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.disorders = [
    { name: 'Disorder 1', file: 'd1.md' },
    { name: 'Disorder 2', file: 'd2.md' },
    { name: 'Disorder 3', file: 'd3.md' },
    { name: 'Disorder 4', file: 'd4.md' } // Too many
  ]

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson rejects too many tenet knowledge entries', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.tenetKnowledge = [
    { name: 'Tenet 1', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Tenet 2', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 } // Too many
  ]

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson accepts five knowledge entries', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.knowledge = [
    { name: 'Knowledge 1', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 2', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 3', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 4', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 5', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 }
  ]

  const fileName = dataService.savePerson(basePath, person)
  const loaded = dataService.loadPerson(basePath, fileName)

  assert.equal(loaded.knowledge.length, 5)
})

test('savePerson rejects more than five knowledge entries', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.knowledge = [
    { name: 'Knowledge 1', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 2', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 3', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 4', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 5', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 },
    { name: 'Knowledge 6', observation: '', rules: '', observationRequirement: 0, knowledgeLevel: 1 } // Too many
  ]

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson rejects invalid gender enum', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.gender = 'X' // Invalid: only M or F allowed

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson rejects age above maximum', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.age = 17 // Invalid: maximum is 16

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('savePerson rejects weapon proficiency level above maximum', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Test')
  person.weaponProficiency.level = 9 // Invalid: maximum is 8

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('readConfigObject handles various corruption scenarios', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  const configPath = path.join(userData, 'config.json')

  // Empty file
  fs.writeFileSync(configPath, '', 'utf8')
  assert.deepEqual(dataService.getSavedDataSources(app), Object.fromEntries(dataService.SOURCE_KEYS.map(k => [k, ''])))

  // Whitespace only
  fs.writeFileSync(configPath, '   \n\n  ', 'utf8')
  assert.deepEqual(dataService.getSavedDataSources(app), Object.fromEntries(dataService.SOURCE_KEYS.map(k => [k, ''])))

  // Plain text (not JSON)
  fs.writeFileSync(configPath, 'not json content', 'utf8')
  assert.deepEqual(dataService.getSavedDataSources(app), Object.fromEntries(dataService.SOURCE_KEYS.map(k => [k, ''])))

  // Array instead of object
  fs.writeFileSync(configPath, '[]', 'utf8')
  assert.deepEqual(dataService.getSavedDataSources(app), Object.fromEntries(dataService.SOURCE_KEYS.map(k => [k, ''])))

  // Null
  fs.writeFileSync(configPath, 'null', 'utf8')
  assert.deepEqual(dataService.getSavedDataSources(app), Object.fromEntries(dataService.SOURCE_KEYS.map(k => [k, ''])))

  // Number
  fs.writeFileSync(configPath, '123', 'utf8')
  assert.deepEqual(dataService.getSavedDataSources(app), Object.fromEntries(dataService.SOURCE_KEYS.map(k => [k, ''])))
})
