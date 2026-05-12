const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')

const dataService = require('../src/dataService')

const DEFAULT_LAN_SETTINGS = {
  survivorDataMode: 'local',
  lanDisplayName: '',
  lanHostAddress: '',
  lanPort: 3765,
  lanAutoReconnect: true,
  lanClientConnected: true,
  lanHostEnabled: false
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-survivors-'))
}

function makeApp(userDataPath) {
  return {
    getPath(name) {
      if (name !== 'userData') throw new Error(`Unexpected app path request: ${name}`)
      return userDataPath
    }
  }
}

test('save/load/list roundtrip with template', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Ava')
  const fileName = dataService.savePerson(basePath, person)

  assert.equal(fileName, `${person.id}_ava.json`)
  assert.deepEqual(dataService.listPeople(basePath), [fileName])

  const loaded = dataService.loadPerson(basePath, fileName)
  assert.equal(loaded.id, person.id)
  assert.equal(loaded.name, 'Ava')
  assert.equal(loaded.age, 0)
})

test('listPeopleSummaries returns settlement-safe summaries and skips unreadable files', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const ava = dataService.createPersonTemplate('Ava')
  ava.philosophy = 'Lantern'
  ava.age = 3
  ava.courage = 4
  ava.understanding = 3
  ava.nextPhilosophyAgeThreshold = 2
  ava.lifetimeReroll = true
  ava.weaponProficiency.type = 'Sword'
  ava.weaponProficiency.level = 2
  ava.abilities = ['Dash']
  ava.knowledge = [{ name: 'Lantern Math' }]
  const avaFileName = dataService.savePerson(basePath, ava)

  fs.writeFileSync(path.join(basePath, 'broken.json'), '{not valid json', 'utf8')

  const result = dataService.listPeopleSummaries(basePath)
  assert.equal(result.totalFiles, 2)
  assert.equal(result.unreadableCount, 1)
  assert.equal(result.records.length, 1)
  assert.deepEqual(result.records[0], {
    fileName: avaFileName,
    person: {
      name: 'Ava',
      age: 3,
      lumi: 0,
      survivalPts: 0,
      insanityPts: 0,
      philosophy: 'Lantern',
      philosophyRank: 0,
      movement: 5,
      speed: 0,
      accuracy: 0,
      strength: 0,
      luck: 0,
      evasion: 0,
      courage: 4,
      understanding: 3,
      lastUpdated: result.records[0].person.lastUpdated,
      lastReturned: null,
      isAlive: true,
      lifetimeReroll: true,
      matchmaker: false,
      tinker: false,
      weaponProficiency: {
        type: 'Sword',
        level: 2
      }
    },
    canPonder: true,
    statsTotal: 5,
    traitSearchText: 'dash lantern math'
  })
})

test('listPeopleSummaries marks ponder-ready survivors by age threshold even without philosophy text', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const ava = dataService.createPersonTemplate('Ava')
  ava.age = 3
  ava.nextPhilosophyAgeThreshold = 2
  dataService.savePerson(basePath, ava)

  const result = dataService.listPeopleSummaries(basePath)
  assert.equal(result.records.length, 1)
  assert.equal(result.records[0].canPonder, true)
})

test('deletePerson removes persisted file', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')

  const person = dataService.createPersonTemplate('Delete Me')
  const fileName = dataService.savePerson(basePath, person)
  assert.deepEqual(dataService.listPeople(basePath), [fileName])

  dataService.deletePerson(basePath, fileName)
  assert.deepEqual(dataService.listPeople(basePath), [])
})

test('savePerson throws ValidationError with structured errors', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const invalidPerson = { name: 'Broken' }

  assert.throws(
    () => dataService.savePerson(basePath, invalidPerson),
    err => {
      assert.equal(err instanceof dataService.ValidationError, true)
      assert.equal(Array.isArray(err.validationErrors), true)
      assert.equal(err.validationErrors.length > 0, true)
      assert.equal(typeof err.validationErrors[0].path, 'string')
      assert.equal(typeof err.validationErrors[0].message, 'string')
      return true
    }
  )
})

test('config save/read and configured folder lookup', () => {
  const userData = makeTempDir()
  const dataPath = path.join(userData, 'game-data')
  const app = makeApp(userData)

  assert.equal(dataService.getSavedDataFolder(app), null)
  dataService.saveConfig(app, dataPath)
  assert.equal(dataService.getSavedDataFolder(app), dataPath)
  assert.equal(dataService.ensureDataFolderConfigured(app), dataPath)
  assert.deepEqual(dataService.getSavedAppSettings(app), { userName: '', dateFormat: 'en-GB', ...DEFAULT_LAN_SETTINGS })
})

test('ensureDataFolderConfigured throws without config', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  assert.throws(() => dataService.ensureDataFolderConfigured(app), /No data folder selected/)
})

test('saveAppSettings persists username without disturbing data sources', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  const dataPath = path.join(userData, 'survivors')

  dataService.saveConfig(app, dataPath)
  const saved = dataService.saveAppSettings(app, { userName: '  Mike  ', dateFormat: 'en-US' })

  assert.deepEqual(saved, { userName: 'Mike', dateFormat: 'en-US', ...DEFAULT_LAN_SETTINGS })
  assert.deepEqual(dataService.getSavedAppSettings(app), { userName: 'Mike', dateFormat: 'en-US', ...DEFAULT_LAN_SETTINGS })
  assert.equal(dataService.getSavedDataFolder(app), dataPath)
})

test('knowledge templates persist reusable entries without current observations', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')
  const tenetKnowledgePath = path.join(root, 'tenet-knowledges')

  const tenetTemplate = {
    name: 'Abyssal Oath',
    neurosis: 'Night Terrors',
    tenet: 'Never retreat',
    observation: 'Hold the line',
    rules: 'Gain +1 strength when wounded',
    observationRequirement: 3,
    knowledgeLevel: 2,
    nextKnowledgeMode: 'existingTemplate',
    nextKnowledgeTemplate: 'abyssal-oath-ii.json',
    currentObservations: 2
  }

  const knowledgeTemplate = {
    name: 'Lantern Math',
    observation: 'Count every strike',
    rules: 'Once per showdown reroll a hit',
    observationRequirement: 5,
    knowledgeLevel: 1,
    nextKnowledgeMode: 'maxLevel',
    currentObservations: 4
  }

  dataService.saveKnowledgeTemplate(tenetKnowledgePath, 'tenetKnowledge', tenetTemplate)
  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', knowledgeTemplate)

  const tenetList = dataService.listKnowledgeTemplates(tenetKnowledgePath, 'tenetKnowledge')
  const knowledgeList = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')

  assert.equal(tenetList.length, 1)
  assert.equal(knowledgeList.length, 1)
  assert.equal(tenetList[0].template.currentObservations, undefined)
  assert.equal(knowledgeList[0].template.currentObservations, undefined)
  assert.equal(tenetList[0].template.observationRequirement, 3)
  assert.equal(knowledgeList[0].template.observationRequirement, 5)
  assert.equal(tenetList[0].template.knowledgeLevel, 2)
  assert.equal(tenetList[0].template.nextKnowledgeMode, 'existingTemplate')
  assert.equal(tenetList[0].template.nextKnowledgeTemplate, 'abyssal-oath-ii.json')
  assert.equal(knowledgeList[0].template.nextKnowledgeMode, 'maxLevel')
})

test('savePerson persists knowledge progression fields', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Progression Check')

  person.tenetKnowledge = [
    {
      name: 'Tenet One',
      neurosis: 'Edge',
      tenet: 'Stand',
      observation: 'Observe',
      rules: 'Rule',
      observationRequirement: 3,
      currentObservations: 2,
      knowledgeLevel: 2,
      nextKnowledgeMode: 'existingTemplate',
      nextKnowledgeTemplate: 'tenet-two.json'
    }
  ]
  person.knowledge = [
    {
      name: 'Knowledge One',
      observation: 'Observe',
      rules: 'Rule',
      observationRequirement: 4,
      currentObservations: 1,
      knowledgeLevel: 1,
      nextKnowledgeMode: 'noTemplate',
      nextKnowledgeTemplate: ''
    }
  ]

  const fileName = dataService.savePerson(basePath, person)
  const loaded = dataService.loadPerson(basePath, fileName)
  assert.equal(loaded.tenetKnowledge[0].knowledgeLevel, 2)
  assert.equal(loaded.tenetKnowledge[0].nextKnowledgeMode, 'existingTemplate')
  assert.equal(loaded.tenetKnowledge[0].nextKnowledgeTemplate, 'tenet-two.json')
  assert.equal(loaded.knowledge[0].knowledgeLevel, 1)
  assert.equal(loaded.knowledge[0].nextKnowledgeMode, 'noTemplate')
})

test('savePerson persists philosophy neurosis name metadata', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Neurosis Name Check')

  person.philosophyNeurosis = 'Fear of the dark between stars.'
  person.philosophyNeurosisName = 'Star Dread'

  const fileName = dataService.savePerson(basePath, person)
  const loaded = dataService.loadPerson(basePath, fileName)
  assert.equal(loaded.philosophyNeurosis, 'Fear of the dark between stars.')
  assert.equal(loaded.philosophyNeurosisName, 'Star Dread')
})

test('savePerson rejects invalid knowledge progression values', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Invalid Progression')

  person.knowledge = [
    {
      name: 'Broken Knowledge',
      observation: '',
      rules: '',
      observationRequirement: 0,
      currentObservations: 0,
      knowledgeLevel: 0,
      nextKnowledgeMode: 'not-valid'
    }
  ]

  assert.throws(
    () => dataService.savePerson(basePath, person),
    err => err instanceof dataService.ValidationError
  )
})

test('saveKnowledgeTemplate normalizes next template field by mode', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'No Template Mode',
    observation: '',
    rules: '',
    observationRequirement: 1,
    knowledgeLevel: 2,
    nextKnowledgeMode: 'noTemplate',
    nextKnowledgeTemplate: 'should-not-survive.json'
  })

  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Existing Template Mode',
    observation: '',
    rules: '',
    observationRequirement: 1,
    knowledgeLevel: 3,
    nextKnowledgeMode: 'existingTemplate',
    nextKnowledgeTemplate: 'next-knowledge.json'
  })

  const items = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')
  const noTemplate = items.find(item => item.name === 'No Template Mode')
  const existingTemplate = items.find(item => item.name === 'Existing Template Mode')
  assert.equal(noTemplate.template.nextKnowledgeTemplate, '')
  assert.equal(existingTemplate.template.nextKnowledgeTemplate, 'next-knowledge.json')
})

test('listKnowledgeTemplates ignores invalid template files', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Valid Template',
    observation: '',
    rules: '',
    observationRequirement: 1
  })

  const brokenPath = path.join(knowledgePath, 'broken.json')
  fs.mkdirSync(path.dirname(brokenPath), { recursive: true })
  fs.writeFileSync(brokenPath, '{ not-json }', 'utf8')

  const listed = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')
  assert.equal(listed.length, 1)
  assert.equal(listed[0].name, 'Valid Template')
})

test('neurosis templates persist and list sorted by name', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  dataService.saveNeurosisTemplate(neurosesPath, {
    name: 'Second Mind',
    neurosis: 'Always question every choice.'
  })
  dataService.saveNeurosisTemplate(neurosesPath, {
    name: 'First Scar',
    neurosis: 'Fear the lantern dark.'
  })

  const listed = dataService.listNeurosisTemplates(neurosesPath)
  assert.equal(listed.length, 2)
  assert.equal(listed[0].name, 'First Scar')
  assert.equal(listed[0].neurosis, 'Fear the lantern dark.')
  assert.equal(listed[1].name, 'Second Mind')
})

test('listNeurosisTemplates ignores invalid template files', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  dataService.saveNeurosisTemplate(neurosesPath, {
    name: 'Valid Neurosis',
    neurosis: 'Persistent dread.'
  })

  const brokenPath = path.join(neurosesPath, 'broken.json')
  fs.mkdirSync(path.dirname(brokenPath), { recursive: true })
  fs.writeFileSync(brokenPath, '{ not-json }', 'utf8')

  const listed = dataService.listNeurosisTemplates(neurosesPath)
  assert.equal(listed.length, 1)
  assert.equal(listed[0].name, 'Valid Neurosis')
})

test('savePerson manages revision and updatedAt metadata', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Meta Survivor')

  const fileName = dataService.savePerson(basePath, person, { editorName: 'Archivist' })
  const first = dataService.loadPerson(basePath, fileName)
  assert.equal(first.revision, 1)
  assert.equal(typeof first.createdAt, 'string')
  assert.equal(typeof first.updatedAt, 'string')
  assert.equal(Number.isNaN(Date.parse(first.updatedAt)), false)
  assert.equal(first.createdAt, person.createdAt)
  assert.equal(first.lastUpdated, first.updatedAt)
  assert.equal(first.lastReturned, null)
  assert.equal(first.editedBy, 'Archivist')

  first.philosophy = 'Updated'
  const fileName2 = dataService.savePerson(basePath, first, { editorName: 'Chronicler', markReturned: true })
  const second = dataService.loadPerson(basePath, fileName2)
  assert.equal(second.revision, 2)
  assert.equal(second.createdAt, first.createdAt)
  assert.equal(second.lastUpdated, second.updatedAt)
  assert.equal(typeof second.lastReturned, 'string')
  assert.equal(Number.isNaN(Date.parse(second.lastReturned)), false)
  assert.equal(second.editedBy, 'Chronicler')
})

test('savePerson writes survivor history snapshot before replacing existing file', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('History Keeper')

  const fileName = dataService.savePerson(basePath, person, { editorName: 'Archivist' })
  const historyRoot = path.join(basePath, 'history')
  assert.equal(fs.existsSync(historyRoot), false)

  const first = dataService.loadPerson(basePath, fileName)
  first.knowledge = [{ name: 'Lantern Math' }]
  dataService.savePerson(basePath, first, { editorName: 'Chronicler' })

  const survivorHistoryFolder = path.join(historyRoot, 'survivors', first.id)
  const files = fs.readdirSync(survivorHistoryFolder)
  assert.equal(files.length, 1)
  assert.match(files[0], /_before-save\.json$/)

  const historyRecord = JSON.parse(fs.readFileSync(path.join(survivorHistoryFolder, files[0]), 'utf8'))
  assert.equal(historyRecord.type, 'survivor_snapshot_before_save')
  assert.equal(historyRecord.survivorId, first.id)
  assert.equal(historyRecord.survivorName, 'History Keeper')
  assert.equal(historyRecord.sourceFileName, fileName)
  assert.equal(historyRecord.targetFileName, fileName)
  assert.equal(historyRecord.editorName, 'Chronicler')
  assert.deepEqual(historyRecord.snapshot.knowledge, [])
  assert.equal(historyRecord.snapshot.revision, 1)
})

test('savePerson does not write history snapshot when conflict rejects save', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('History Conflict')
  const fileName = dataService.savePerson(basePath, person)

  const sessionA = dataService.loadPerson(basePath, fileName)
  const sessionB = dataService.loadPerson(basePath, fileName)
  sessionA.philosophy = 'A changes'
  dataService.savePerson(basePath, sessionA)

  const historyFolder = path.join(basePath, 'history', 'survivors', sessionA.id)
  const historyCountBefore = fs.readdirSync(historyFolder).length

  sessionB.philosophy = 'B stale changes'
  assert.throws(
    () => dataService.savePerson(basePath, sessionB),
    err => err instanceof dataService.ConflictError
  )
  assert.equal(fs.readdirSync(historyFolder).length, historyCountBefore)
})

test('savePerson archives expected source file when renaming survivor', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Old Name')
  const originalFile = dataService.savePerson(basePath, person)

  const loaded = dataService.loadPerson(basePath, originalFile)
  loaded.name = 'New Name'
  const renamedFile = dataService.savePerson(basePath, loaded, { expectedFileName: originalFile, editorName: 'Renamer' })
  assert.equal(renamedFile, `${loaded.id}_new-name.json`)
  assert.equal(fs.existsSync(path.join(basePath, originalFile)), false)

  const historyFolder = path.join(basePath, 'history', 'survivors', loaded.id)
  const files = fs.readdirSync(historyFolder)
  assert.equal(files.length, 1)

  const historyRecord = JSON.parse(fs.readFileSync(path.join(historyFolder, files[0]), 'utf8'))
  assert.equal(historyRecord.sourceFileName, originalFile)
  assert.equal(historyRecord.targetFileName, renamedFile)
  assert.equal(historyRecord.editorName, 'Renamer')
  assert.equal(historyRecord.snapshot.name, 'Old Name')
})

test('loadPerson assigns deterministic id to legacy name-only survivor files', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const legacy = dataService.createPersonTemplate('Legacy Named')
  delete legacy.id
  legacy.schemaVersion = 3
  fs.writeFileSync(path.join(basePath, 'legacy-named.json'), JSON.stringify(legacy, null, 2), 'utf8')

  const loadedA = dataService.loadPerson(basePath, 'legacy-named.json')
  const loadedB = dataService.loadPerson(basePath, 'legacy-named.json')
  assert.equal(loadedA.id, 'survivor-legacy-legacy-named')
  assert.equal(loadedB.id, loadedA.id)

  const migratedFile = dataService.savePerson(basePath, loadedA, { expectedFileName: 'legacy-named.json' })
  assert.equal(migratedFile, 'survivor-legacy-legacy-named_legacy-named.json')
  assert.equal(fs.existsSync(path.join(basePath, 'legacy-named.json')), false)
})

test('savePerson discovers existing survivor by id when name changes without expected filename', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Raw Name')
  const originalFile = dataService.savePerson(basePath, person)

  const loaded = dataService.loadPerson(basePath, originalFile)
  loaded.name = 'Raw Rename'
  const renamedFile = dataService.savePerson(basePath, loaded)

  assert.equal(renamedFile, `${loaded.id}_raw-rename.json`)
  assert.equal(fs.existsSync(path.join(basePath, originalFile)), false)
  assert.equal(fs.existsSync(path.join(basePath, renamedFile)), true)

  const historyFolder = path.join(basePath, 'history', 'survivors', loaded.id)
  const files = fs.readdirSync(historyFolder)
  assert.equal(files.length, 1)
  const historyRecord = JSON.parse(fs.readFileSync(path.join(historyFolder, files[0]), 'utf8'))
  assert.equal(historyRecord.sourceFileName, originalFile)
  assert.equal(historyRecord.targetFileName, renamedFile)
  assert.equal(historyRecord.snapshot.name, 'Raw Name')
})

test('savePerson throws ConflictError on stale revision', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Conflict Survivor')
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

test('savePerson throws ConflictError for stale rename when expected file changed', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  const person = dataService.createPersonTemplate('Rename Source')
  const originalFile = dataService.savePerson(basePath, person)

  const staleSession = dataService.loadPerson(basePath, originalFile)
  const liveSession = dataService.loadPerson(basePath, originalFile)
  liveSession.philosophy = 'Concurrent change'
  dataService.savePerson(basePath, liveSession)

  staleSession.name = 'Rename Target'
  assert.throws(
    () => dataService.savePerson(basePath, staleSession, { expectedFileName: originalFile }),
    err => err instanceof dataService.ConflictError
  )
})

test('loadPerson auto-populates missing schemaVersion for legacy records', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('Legacy Survivor')
  delete person.schemaVersion
  const filePath = path.join(basePath, 'legacy-survivor.json')
  fs.writeFileSync(filePath, JSON.stringify(person, null, 2), 'utf8')

  const loaded = dataService.loadPerson(basePath, 'legacy-survivor.json')
  assert.equal(loaded.schemaVersion, 5)
  assert.deepEqual(loaded.notes, [])
  assert.equal(loaded.lastUpdated, loaded.updatedAt)
  assert.equal(loaded.lastReturned, null)
  assert.equal(loaded.editedBy, '')
})

test('loadPerson rejects unsupported future schemaVersion', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  const person = dataService.createPersonTemplate('Future Survivor')
  person.schemaVersion = 999
  const filePath = path.join(basePath, 'future-survivor.json')
  fs.writeFileSync(filePath, JSON.stringify(person, null, 2), 'utf8')

  assert.throws(
    () => dataService.loadPerson(basePath, 'future-survivor.json'),
    err => err instanceof dataService.ValidationError
  )
})
