const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')

const dataService = require('../src/dataService')

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-survivors-edge-'))
}

function makeApp(userDataPath) {
  return {
    getPath(name) {
      if (name !== 'userData') throw new Error(`Unexpected app path request: ${name}`)
      return userDataPath
    }
  }
}

function blankSources() {
  return Object.fromEntries(dataService.SOURCE_KEYS.map(key => [key, '']))
}

test('getSavedDataSources reads legacy config dataPath and trims it', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  const legacyPath = path.join(userData, 'legacy-survivors')
  const configPath = path.join(userData, 'config.json')
  fs.writeFileSync(configPath, JSON.stringify({ dataPath: `  ${legacyPath}  ` }, null, 2), 'utf8')

  const sources = dataService.getSavedDataSources(app)
  assert.equal(sources.survivors, legacyPath)
  for (const key of dataService.SOURCE_KEYS) {
    if (key === 'survivors') continue
    assert.equal(sources[key], '')
  }
})

test('getSavedDataSources returns empty normalized sources for invalid config JSON', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  fs.writeFileSync(path.join(userData, 'config.json'), '{ invalid-json }', 'utf8')

  assert.deepEqual(dataService.getSavedDataSources(app), blankSources())
})

test('setDataSource validates inputs and persists trimmed path', () => {
  const userData = makeTempDir()
  const app = makeApp(userData)
  const survivorsPath = path.join(userData, 'survivors')

  assert.throws(() => dataService.setDataSource(app, 'not-a-source', survivorsPath), /Invalid data source key/)
  assert.throws(() => dataService.setDataSource(app, 'survivors', '   '), /Invalid folder path/)

  const next = dataService.setDataSource(app, 'survivors', `  ${survivorsPath}  `)
  assert.equal(next.survivors, survivorsPath)
  assert.equal(dataService.getSavedDataSources(app).survivors, survivorsPath)
})

test('save/load default create template roundtrip and null when missing', () => {
  const root = makeTempDir()
  const templateDir = path.join(root, 'defaults')
  const template = dataService.createPersonTemplate('Default Survivor')
  template.age = 4
  template.philosophy = 'Skylore'

  const fileName = dataService.saveDefaultCreateTemplate(templateDir, template)
  assert.equal(fileName, 'default-new-survivor.json')

  const loaded = dataService.loadDefaultCreateTemplate(templateDir)
  assert.equal(loaded.name, 'Default Survivor')
  assert.equal(loaded.age, 4)
  assert.equal(loaded.philosophy, 'Skylore')
  assert.equal(loaded.schemaVersion, 1)

  assert.equal(dataService.loadDefaultCreateTemplate(path.join(root, 'missing')), null)
  assert.equal(dataService.loadDefaultCreateTemplate(''), null)
})

test('saveDefaultCreateTemplate rejects blank base path', () => {
  const template = dataService.createPersonTemplate('Template')
  assert.throws(
    () => dataService.saveDefaultCreateTemplate('   ', template),
    /Default survivor template folder is not configured/
  )
})

test('loadPerson and deletePerson validate filename and missing files', () => {
  const root = makeTempDir()
  const basePath = path.join(root, 'data')
  fs.mkdirSync(basePath, { recursive: true })

  assert.throws(() => dataService.loadPerson(basePath, 'not-json.txt'), /Invalid person filename/)
  assert.throws(() => dataService.deletePerson(basePath, 'not-json.txt'), /Invalid person filename/)
  assert.throws(() => dataService.loadPerson(basePath, 'missing.json'), /Person file not found/)
  assert.throws(() => dataService.deletePerson(basePath, 'missing.json'), /Person file not found/)
})

test('listMarkdownCollections and listMarkdownFiles include only markdown files', () => {
  const root = makeTempDir()
  const fightingArtsPath = path.join(root, 'fighting-arts')
  const disordersPath = path.join(root, 'disorders')
  fs.mkdirSync(path.join(fightingArtsPath, 'nested'), { recursive: true })
  fs.mkdirSync(disordersPath, { recursive: true })
  fs.writeFileSync(path.join(fightingArtsPath, 'nested', 'alpha-strike.md'), 'Alpha preview', 'utf8')
  fs.writeFileSync(path.join(fightingArtsPath, 'zeta-note.MD'), 'Zeta preview', 'utf8')
  fs.writeFileSync(path.join(fightingArtsPath, 'ignore.txt'), 'Ignored', 'utf8')
  fs.writeFileSync(path.join(disordersPath, 'broken-mind.md'), 'Disorder preview', 'utf8')

  const collections = dataService.listMarkdownCollections({
    fightingArts: fightingArtsPath,
    disorders: disordersPath
  })
  assert.deepEqual(
    collections.map(item => ({ id: item.id, count: item.count })),
    [
      { id: 'disorders', count: 1 },
      { id: 'fightingArts', count: 2 }
    ]
  )

  const files = dataService.listMarkdownFiles({ fightingArts: fightingArtsPath }, 'fightingArts')
  assert.deepEqual(
    files.map(item => item.fileName),
    ['nested/alpha-strike.md', 'zeta-note.MD']
  )
})

test('loadMarkdownFile normalizes obsidian-style links and tags', () => {
  const root = makeTempDir()
  const fightingArtsPath = path.join(root, 'fighting-arts')
  fs.mkdirSync(fightingArtsPath, { recursive: true })
  fs.writeFileSync(
    path.join(fightingArtsPath, 'obsidian.md'),
    'Use [[Lantern Lore|Lantern Lore II]] and ![[icon-token.png]] with #secret',
    'utf8'
  )

  const doc = dataService.loadMarkdownFile(
    { fightingArts: fightingArtsPath },
    'fightingArts',
    'obsidian.md'
  )
  assert.equal(doc.title, 'Obsidian')
  assert.ok(doc.markdown.includes('Lantern Lore II'))
  assert.ok(doc.markdown.includes('icon-token.png'))
  assert.ok(!doc.markdown.includes('[['))
  assert.ok(!doc.markdown.includes('#secret'))
})

test('loadMarkdownFile rejects traversal and invalid file names', () => {
  const root = makeTempDir()
  const disordersPath = path.join(root, 'disorders')
  fs.mkdirSync(disordersPath, { recursive: true })
  fs.writeFileSync(path.join(disordersPath, 'valid.md'), 'Content', 'utf8')

  assert.throws(
    () => dataService.loadMarkdownFile({ disorders: disordersPath }, 'disorders', '../secret.md'),
    /Invalid markdown filename/
  )
  assert.throws(
    () => dataService.loadMarkdownFile({ disorders: disordersPath }, 'disorders', '..\\secret.md'),
    /Invalid markdown filename/
  )
  assert.throws(
    () => dataService.loadMarkdownFile({ disorders: disordersPath }, 'disorders', '/absolute.md'),
    /Invalid markdown filename/
  )
  assert.throws(
    () => dataService.loadMarkdownFile({ disorders: disordersPath }, 'disorders', 'wrong.txt'),
    /Invalid markdown filename/
  )
  assert.throws(
    () => dataService.loadMarkdownFile({ disorders: disordersPath }, 'disorders', 'missing.md'),
    /Markdown file not found/
  )
})

test('markdown collection APIs validate collection id and source availability', () => {
  const root = makeTempDir()
  const fightingArtsPath = path.join(root, 'fighting-arts')
  fs.mkdirSync(fightingArtsPath, { recursive: true })

  assert.throws(
    () => dataService.listMarkdownFiles({ fightingArts: fightingArtsPath }, 'unknown-collection'),
    /Invalid markdown collection id/
  )
  assert.throws(() => dataService.listMarkdownFiles({}, 'fightingArts'), /Markdown source is unavailable/)
  assert.throws(
    () => dataService.listMarkdownFiles({ fightingArts: path.join(root, 'missing') }, 'fightingArts'),
    /Markdown collection not found/
  )
})
