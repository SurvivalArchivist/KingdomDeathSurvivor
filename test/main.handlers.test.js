/**
 * Comprehensive tests for all IPC handlers in main.js
 */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const Module = require('module')
const { EventEmitter } = require('events')

const mainPath = path.join(__dirname, '..', 'src', 'main.js')

class ConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConflictError'
  }
}

class ValidationError extends Error {
  constructor(message, validationErrors) {
    super(message)
    this.name = 'ValidationError'
    this.validationErrors = validationErrors
  }
}

function makeHarness(overrides = {}) {
  const handlers = new Map()
  let markdownRenderInput = null

  const BrowserWindow = class {
    constructor(options) {
      this.options = options
      this.loadedFile = null
      this.menuBarVisible = true
      this.fullScreen = false
      this.listeners = new Map()
      this.sentMessages = []
      this.webContents = {
        send: (channel, ...args) => {
          this.sentMessages.push({ channel, args })
        }
      }
      BrowserWindow.instances.push(this)
    }

    setMenuBarVisibility(visible) {
      this.menuBarVisible = visible
    }

    loadFile(filePath) {
      this.loadedFile = filePath
    }

    on(eventName, listener) {
      const key = String(eventName)
      const list = this.listeners.get(key) || []
      list.push(listener)
      this.listeners.set(key, list)
    }

    emit(eventName) {
      const key = String(eventName)
      const list = this.listeners.get(key) || []
      for (const listener of list) listener()
    }

    setFullScreen(nextValue) {
      this.fullScreen = Boolean(nextValue)
      this.emit(this.fullScreen ? 'enter-full-screen' : 'leave-full-screen')
    }

    isFullScreen() {
      return this.fullScreen
    }

    isDestroyed() {
      return false
    }

    static getAllWindows() {
      return BrowserWindow.instances
    }
  }
  BrowserWindow.instances = []

  const app = {
    dock: {
      setIcon() {}
    },
    getPath(name) {
      if (name === 'userData') return '/tmp/kdm-user-data'
      return '/tmp'
    },
    whenReady() {
      return Promise.resolve()
    },
    on() {},
    quit() {}
  }

  const dialog = {
    async showOpenDialog() {
      return { canceled: true, filePaths: [] }
    }
  }

  const nativeImage = {
    createFromPath(iconPath) {
      return {
        iconPath,
        isEmpty() {
          return false
        }
      }
    }
  }

  const Menu = {
    setApplicationMenu() {}
  }
  const dgramMock = overrides.dgram || {
    createSocket() {
      const socket = new EventEmitter()
      socket.bind = (_port, callback) => {
        process.nextTick(callback)
      }
      socket.setBroadcast = () => {}
      socket.send = () => {}
      socket.close = () => {}
      return socket
    }
  }

  const dataService = {
    ConflictError,
    ValidationError,
    setDataSource() {
      return {}
    },
    getSavedDataSources() {
      return {}
    },
    getSavedAppSettings() {
      return { userName: '' }
    },
    saveAppSettings(_app, settings) {
      return settings
    },
    ensureDataFolderConfigured() {
      return '/tmp/survivors'
    },
    listPeople() {
      return []
    },
    listPeopleSummaries() {
      return { records: [], unreadableCount: 0, totalFiles: 0 }
    },
    loadPerson() {
      return {}
    },
    savePerson() {
      return 'saved.json'
    },
    deletePerson() {},
    createPersonTemplate(name) {
      return { name }
    },
    saveDefaultCreateTemplate() {
      return 'default-new-survivor.json'
    },
    loadDefaultCreateTemplate() {
      return null
    },
    listMarkdownCollections() {
      return []
    },
    listMarkdownFiles() {
      return []
    },
    loadMarkdownFile() {
      return { collectionId: 'knowledges', folder: '/tmp/knowledges', fileName: 'entry.md', title: 'Entry', markdown: '' }
    },
    saveKnowledgeTemplate() {
      return 'entry-1.json'
    },
    listKnowledgeTemplates() {
      return []
    },
    saveNeurosisTemplate() {
      return 'neurosis.json'
    },
    listNeurosisTemplates() {
      return []
    }
  }

  const electron = {
    app,
    BrowserWindow,
    ipcMain: {
      handle(channel, handler) {
        handlers.set(channel, handler)
      }
    },
    dialog,
    nativeImage,
    Menu
  }

  if (overrides.dataService) Object.assign(dataService, overrides.dataService)
  if (overrides.dialog) Object.assign(dialog, overrides.dialog)
  if (overrides.app) Object.assign(app, overrides.app)
  if (overrides.nativeImage) Object.assign(nativeImage, overrides.nativeImage)
  if (overrides.Menu) Object.assign(Menu, overrides.Menu)

  function MarkdownItMock() {
    return {
      render(markdown) {
        markdownRenderInput = markdown
        if (typeof overrides.markdownRender === 'function') return overrides.markdownRender(markdown)
        return `<p>${markdown}</p>`
      }
    }
  }

  const originalLoad = Module._load
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'electron') return electron
    if (request === './dataService') return dataService
    if (request === './lanSurvivorHost' && overrides.lanSurvivorHost) return overrides.lanSurvivorHost
    if (request === 'dgram') return dgramMock
    if (request === 'os' && overrides.os) return overrides.os
    if (request === 'markdown-it') return MarkdownItMock
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[mainPath]
  require(mainPath)
  Module._load = originalLoad

  return {
    app,
    dataService,
    electron,
    handlers,
    getMarkdownRenderInput() {
      return markdownRenderInput
    },
    async ready() {
      await new Promise(resolve => setImmediate(resolve))
    },
    cleanup() {
      delete require.cache[mainPath]
    }
  }
}

// ============================================
// Tests for person handlers
// ============================================

test('create-person-template handler creates template with name', async t => {
  const harness = makeHarness({
    app: {
      whenReady() {
        return new Promise(() => {})
      }
    },
    dataService: {
      createPersonTemplate(name) {
        return { name, created: true }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('create-person-template')
  const result = await handler(null, 'New Survivor')
  assert.deepEqual(result, { name: 'New Survivor', created: true })
})

test('create-person-template handler creates template with default name', async t => {
  const harness = makeHarness({
    dataService: {
      createPersonTemplate(name) {
        // Real dataService has default parameter 'New Survivor'
        return { name: name || 'New Survivor' }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('create-person-template')
  const result = await handler(null)
  assert.equal(result.name, 'New Survivor')
})

test('list-people handler returns people list', async t => {
  const harness = makeHarness({
    dataService: {
      listPeople() {
        return ['alice.json', 'bob.json', 'carol.json']
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-people')
  const result = await handler()
  assert.deepEqual(result, ['alice.json', 'bob.json', 'carol.json'])
})

test('list-people-summaries handler returns settlement summaries', async t => {
  const summaries = {
    records: [{ fileName: 'alice.json', person: { name: 'Alice', isAlive: true }, canPonder: false, statsTotal: 5, traitSearchText: '' }],
    unreadableCount: 1,
    totalFiles: 2
  }
  const harness = makeHarness({
    dataService: {
      listPeopleSummaries() {
        return summaries
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-people-summaries')
  const result = await handler()
  assert.deepEqual(result, summaries)
})

test('load-person handler loads person from data folder', async t => {
  const harness = makeHarness({
    dataService: {
      loadPerson(basePath, fileName) {
        return { name: 'Alice', fileName }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('load-person')
  const result = await handler(null, 'alice.json')
  assert.deepEqual(result, { name: 'Alice', fileName: 'alice.json' })
})


test('delete-person handler deletes and returns success', async t => {
  let deletedFile = null
  const harness = makeHarness({
    dataService: {
      deletePerson(basePath, fileName) {
        deletedFile = fileName
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('delete-person')
  const result = await handler(null, 'alice.json')
  assert.deepEqual(result, { deleted: true })
  assert.equal(deletedFile, 'alice.json')
})

test('delete-person handler maps survivor errors to payloads', async t => {
  const harness = makeHarness({
    dataService: {
      deletePerson() {
        throw new ConflictError('Stale survivor revision')
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('delete-person')
  const result = await handler(null, 'alice.json')
  assert.deepEqual(result, {
    deleted: false,
    ok: false,
    errorType: 'conflict',
    message: 'Stale survivor revision'
  })
})


// ============================================
// Tests for markdown handlers
// ============================================

test('list-markdown-collections handler returns collections', async t => {
  const collections = [
    { id: 'fightingArts', label: 'Fighting Arts', count: 5 },
    { id: 'disorders', label: 'Disorders', count: 3 }
  ]
  const harness = makeHarness({
    dataService: {
      listMarkdownCollections() {
        return collections
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-markdown-collections')
  const result = await handler()
  assert.deepEqual(result, collections)
})

test('list-markdown-files handler returns files for collection', async t => {
  const files = [
    { fileName: 'alpha-strike.md', title: 'Alpha Strike' },
    { fileName: 'beta-guard.md', title: 'Beta Guard' }
  ]
  const harness = makeHarness({
    dataService: {
      listMarkdownFiles(dataSources, collectionId) {
        return files
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-markdown-files')
  const result = await handler(null, 'fightingArts')
  assert.deepEqual(result, files)
})

test('load-markdown-file handler renders markdown to HTML', async t => {
  const harness = makeHarness({
    dataService: {
      loadMarkdownFile(_sources, collectionId, fileName) {
        return {
          collectionId,
          folder: '/tmp/knowledges',
          fileName,
          title: 'Lantern Lore',
          markdown: '**Bold** and *italic* text'
        }
      }
    },
    markdownRender(markdown) {
      return `<rendered>${markdown}</rendered>`
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('load-markdown-file')
  const result = await handler(null, 'knowledges', 'lantern-lore.md')

  assert.equal(result.title, 'Lantern Lore')
  assert.equal(result.html, '<rendered>**Bold** and *italic* text</rendered>')
  assert.equal(result.collectionId, 'knowledges')
  assert.equal(result.fileName, 'lantern-lore.md')
})

// ============================================
// Tests for template handlers
// ============================================

test('save-default-create-template handler saves and returns file name', async t => {
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { defaultSurvivorTemplates: '/tmp/templates' }
      },
      saveDefaultCreateTemplate(path, template) {
        return 'default-new-survivor.json'
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-default-create-template')
  const result = await handler(null, { name: 'New Template' })

  assert.deepEqual(result, { ok: true, fileName: 'default-new-survivor.json' })
})


test('load-default-create-template handler returns template', async t => {
  const template = { name: 'Default', age: 4 }
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { defaultSurvivorTemplates: '/tmp/templates' }
      },
      loadDefaultCreateTemplate(path) {
        return template
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('load-default-create-template')
  const result = await handler()
  assert.deepEqual(result, template)
})

test('load-default-create-template handler returns null when no folder', async t => {
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { defaultSurvivorTemplates: '' }
      },
      loadDefaultCreateTemplate() {
        return null
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('load-default-create-template')
  const result = await handler()
  assert.equal(result, null)
})

test('save-knowledge-template handler saves template', async t => {
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { knowledges: '/tmp/knowledges' }
      },
      saveKnowledgeTemplate(path, type, template) {
        return 'knowledge-1.json'
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-knowledge-template')
  const result = await handler(null, 'knowledge', { name: 'Test Knowledge' })

  assert.deepEqual(result, { ok: true, fileName: 'knowledge-1.json' })
})


test('list-knowledge-templates handler lists templates', async t => {
  const templates = [
    { id: 'test-1.json', fileName: 'test-1.json', name: 'Test 1' },
    { id: 'test-2.json', fileName: 'test-2.json', name: 'Test 2' }
  ]
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { knowledges: '/tmp/knowledges' }
      },
      listKnowledgeTemplates(path, type) {
        return templates
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-knowledge-templates')
  const result = await handler(null, 'knowledge')
  assert.deepEqual(result, templates)
})

test('list-knowledge-templates handler returns empty when no knowledges folder', async t => {
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { knowledges: '' }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-knowledge-templates')
  const result = await handler(null, 'knowledge')
  assert.deepEqual(result, [])
})

test('save-neurosis-template handler saves template', async t => {
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { neuroses: '/tmp/neuroses' }
      },
      saveNeurosisTemplate(path, template) {
        return 'fear-1.json'
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-neurosis-template')
  const result = await handler(null, { name: 'Fear', neurosis: 'Fear text' })

  assert.deepEqual(result, { ok: true, fileName: 'fear-1.json' })
})


test('list-neurosis-templates handler lists templates', async t => {
  const templates = [
    { id: 'fear-1.json', fileName: 'fear-1.json', name: 'Fear 1', neurosis: 'Fear text 1' },
    { id: 'fear-2.json', fileName: 'fear-2.json', name: 'Fear 2', neurosis: 'Fear text 2' }
  ]
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { neuroses: '/tmp/neuroses' }
      },
      listNeurosisTemplates(path) {
        return templates
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-neurosis-templates')
  const result = await handler()
  assert.deepEqual(result, templates)
})

test('list-neurosis-templates handler returns empty when no neuroses folder', async t => {
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { neuroses: '' }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('list-neurosis-templates')
  const result = await handler()
  assert.deepEqual(result, [])
})

// ============================================
// Tests for data source handlers
// ============================================

test('get-saved-data-sources handler returns data sources', async t => {
  const dataSources = {
    survivors: '/tmp/survivors',
    fightingArts: '/tmp/arts',
    knowledges: ''
  }
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return dataSources
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('get-saved-data-sources')
  const result = await handler()
  assert.deepEqual(result, dataSources)
})

test('select-data-source-folder updates data source', async t => {
  let setDataCalled = false
  let setDataArgs = null
  const harness = makeHarness({
    dataService: {
      setDataSource(app, sourceKey, folderPath) {
        setDataCalled = true
        setDataArgs = { sourceKey, folderPath }
        return { survivors: folderPath }
      }
    },
    dialog: {
      async showOpenDialog() {
        return { canceled: false, filePaths: ['/selected/path'] }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('select-data-source-folder')
  const result = await handler(null, 'survivors')

  assert.equal(setDataCalled, true)
  assert.deepEqual(setDataArgs, { sourceKey: 'survivors', folderPath: '/selected/path' })
  assert.deepEqual(result, {
    sourceKey: 'survivors',
    folderPath: '/selected/path',
    dataSources: { survivors: '/selected/path' }
  })
})

test('select-data-source-folder returns null when canceled', async t => {
  const harness = makeHarness({
    dialog: {
      async showOpenDialog() {
        return { canceled: true, filePaths: [] }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('select-data-source-folder')
  const result = await handler(null, 'survivors')
  assert.equal(result, null)
})

// ============================================
// Tests for app settings handlers
// ============================================

test('get-app-settings handler returns settings', async t => {
  const settings = { userName: 'Mike', dateFormat: 'en-GB' }
  const harness = makeHarness({
    dataService: {
      getSavedAppSettings() {
        return settings
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('get-app-settings')
  const result = await handler()
  assert.deepEqual(result, settings)
})

test('save-app-settings handler saves and returns settings', async t => {
  let savedSettings = null
  const harness = makeHarness({
    dataService: {
      saveAppSettings(app, settings) {
        savedSettings = settings
        return {
          userName: String(settings.userName || '').trim(),
          dateFormat: settings.dateFormat === 'en-US' ? 'en-US' : 'en-GB'
        }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-app-settings')
  const result = await handler(null, { userName: '  Mike  ', dateFormat: 'en-US' })
  assert.deepEqual(result, { userName: 'Mike', dateFormat: 'en-US' })
  assert.deepEqual(savedSettings, { userName: '  Mike  ', dateFormat: 'en-US' })
})

test('save-app-settings rolls back host enabled when LAN host start fails', async t => {
  let currentSettings = { survivorDataMode: 'local', lanHostEnabled: false, lanPort: 3765 }
  const savedSettings = []
  const harness = makeHarness({
    app: {
      whenReady() {
        return new Promise(() => {})
      }
    },
    dataService: {
      getSavedAppSettings() {
        return currentSettings
      },
      saveAppSettings(_app, settings) {
        currentSettings = { ...settings }
        savedSettings.push({ ...settings })
        return currentSettings
      }
    },
    lanSurvivorHost: {
      createLanSurvivorHost() {
        return {
          async start() {
            throw new Error('Port already in use')
          },
          async stop() {
            return { running: false, port: null }
          },
          getStatus() {
            return { running: false, port: null }
          }
        }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-app-settings')
  await assert.rejects(
    () => handler(null, { survivorDataMode: 'lan-host', lanHostEnabled: true, lanPort: 3765 }),
    /Port already in use/
  )

  assert.deepEqual(savedSettings, [
    { survivorDataMode: 'lan-host', lanHostEnabled: true, lanPort: 3765 },
    { survivorDataMode: 'lan-host', lanHostEnabled: false, lanPort: 3765 }
  ])
})

test('get-lan-connection-status reports local and offline LAN states', async t => {
  let settings = { survivorDataMode: 'local' }
  const harness = makeHarness({
    dataService: {
      getSavedAppSettings() {
        return settings
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('get-lan-connection-status')
  assert.deepEqual(await handler(), {
    mode: 'local',
    state: 'local',
    label: 'Local',
    message: 'Using local survivor files'
  })

  settings = { survivorDataMode: 'lan-host', lanHostEnabled: false, lanPort: 3765 }
  assert.deepEqual(await handler(), {
    mode: 'lan-host',
    state: 'offline',
    label: 'Offline',
    message: 'LAN host is not enabled'
  })

  settings = { survivorDataMode: 'lan-client', lanHostAddress: '', lanPort: 3765 }
  assert.deepEqual(await handler(), {
    mode: 'lan-client',
    state: 'error',
    label: 'Error',
    message: 'No LAN host address configured'
  })
})

test('get-lan-host-info reports LAN URLs from local network interfaces', async t => {
  let settings = { survivorDataMode: 'lan-host', lanHostEnabled: true, lanPort: 3765 }
  const harness = makeHarness({
    dataService: {
      getSavedAppSettings() {
        return settings
      }
    },
    os: {
      networkInterfaces() {
        return {
          en0: [
            { family: 'IPv4', internal: false, address: '192.168.1.44' },
            { family: 'IPv6', internal: false, address: 'fe80::1' }
          ],
          lo0: [{ family: 'IPv4', internal: true, address: '127.0.0.1' }]
        }
      }
    },
    lanSurvivorHost: {
      createLanSurvivorHost() {
        return {
          async start() {
            return { running: true, port: 4567 }
          },
          async stop() {
            return { running: false, port: null }
          },
          getStatus() {
            return { running: true, port: 4567 }
          }
        }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('get-lan-host-info')
  assert.deepEqual(await handler(), {
    running: true,
    port: 4567,
    addresses: ['192.168.1.44'],
    urls: ['http://192.168.1.44:4567']
  })
})

test('LAN discovery records advertised hosts', async t => {
  let socket = null
  const harness = makeHarness({
    dgram: {
      createSocket() {
        socket = new EventEmitter()
        socket.bind = (_port, callback) => {
          process.nextTick(callback)
        }
        socket.setBroadcast = () => {}
        socket.send = () => {}
        socket.close = () => {}
        return socket
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.ready()

  socket.emit(
    'message',
    Buffer.from(JSON.stringify({ type: 'kdm-survivor-host', version: 1, displayName: 'Table Host', port: 4567 })),
    { address: '192.168.1.50' }
  )

  const handler = harness.handlers.get('get-lan-discovered-hosts')
  assert.deepEqual(await handler(), [
    {
      id: '192.168.1.50:4567',
      address: '192.168.1.50',
      port: 4567,
      url: 'http://192.168.1.50:4567',
      displayName: 'Table Host',
      lastSeen: (await handler())[0].lastSeen
    }
  ])
})

test('export-survivor-data-backup copies survivor folder to chosen destination', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-backup-test-'))
  const source = path.join(root, 'survivors')
  const destination = path.join(root, 'backups')
  fs.mkdirSync(source, { recursive: true })
  fs.mkdirSync(destination, { recursive: true })
  fs.writeFileSync(path.join(source, 'alice.json'), '{"name":"Alice"}')
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  const harness = makeHarness({
    dataService: {
      ensureDataFolderConfigured() {
        return source
      }
    },
    dialog: {
      async showOpenDialog() {
        return { canceled: false, filePaths: [destination] }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('export-survivor-data-backup')
  const result = await handler()
  assert.equal(result.ok, true)
  assert.equal(result.sourcePath, source)
  assert.ok(result.backupPath.startsWith(destination))
  assert.equal(fs.readFileSync(path.join(result.backupPath, 'alice.json'), 'utf8'), '{"name":"Alice"}')
})

// ============================================
// Tests for fullscreen handlers
// ============================================


test('get-full-screen-state handler returns false when no window', async t => {
  const harness = makeHarness({
    app: {
      ...{},
      getPath() { return '/tmp' },
      whenReady() { return Promise.resolve() },
      on() {},
      quit() {},
      dock: { setIcon() {} }
    }
  })
  // Force no windows
  harness.electron.BrowserWindow.instances = []
  t.after(() => harness.cleanup())
  await harness.ready()

  const handler = harness.handlers.get('get-full-screen-state')
  const result = await handler()
  assert.deepEqual(result, { isFullScreen: false })
})

// ============================================
// Tests for window lifecycle
// ============================================

test('create-window loads index.html', async t => {
  const harness = makeHarness()
  t.after(() => harness.cleanup())
  await harness.ready()

  assert.equal(harness.electron.BrowserWindow.instances.length, 1)
  const window = harness.electron.BrowserWindow.instances[0]
  assert.ok(window.loadedFile.includes('index.html'))
})

test('full-screen state sends event to renderer', async t => {
  const harness = makeHarness()
  t.after(() => harness.cleanup())
  await harness.ready()

  const window = harness.electron.BrowserWindow.instances[0]
  const initialMessages = window.sentMessages.length

  // First set full screen state on the window (as setFullScreen would)
  window.setFullScreen(true)

  // Then simulate the event
  window.emit('enter-full-screen')

  const newMessages = window.sentMessages.slice(initialMessages)
  assert.ok(newMessages.some(msg => msg.channel === 'window-full-screen-changed'))
  const stateMessage = newMessages.find(msg => msg.channel === 'window-full-screen-changed')
  assert.equal(stateMessage.args[0], true)
})
