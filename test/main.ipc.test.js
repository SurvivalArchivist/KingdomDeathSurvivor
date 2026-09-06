const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const Module = require('module')

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

  let markdownRenderInput = null
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

test('save-person handler maps ConflictError to conflict payload', async t => {
  const harness = makeHarness({
    dataService: {
      savePerson() {
        throw new ConflictError('Stale survivor revision')
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-person')
  const result = await handler(null, { name: 'Ava' }, { expectedFileName: 'ava.json' })
  assert.deepEqual(result, {
    ok: false,
    errorType: 'conflict',
    message: 'Stale survivor revision'
  })
})

test('save-person handler maps ValidationError and includes structured errors', async t => {
  const validationErrors = [{ path: '/name', message: 'is required', keyword: 'required' }]
  const harness = makeHarness({
    dataService: {
      savePerson() {
        throw new ValidationError('Invalid payload', validationErrors)
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-person')
  const result = await handler(null, { name: '' })
  assert.deepEqual(result, {
    ok: false,
    errorType: 'validation',
    message: 'Invalid payload',
    errors: validationErrors
  })
})

test('save-person handler injects saved username into save options', async t => {
  let receivedOptions = null
  const harness = makeHarness({
    dataService: {
      getSavedAppSettings() {
        return { userName: 'Watcher' }
      },
      savePerson(_basePath, _person, options) {
        receivedOptions = options
        return 'watcher.json'
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('save-person')
  const result = await handler(null, { name: 'Ava' }, { expectedFileName: 'ava.json', markReturned: true })
  assert.deepEqual(result, { ok: true, fileName: 'watcher.json' })
  assert.deepEqual(receivedOptions, {
    expectedFileName: 'ava.json',
    markReturned: true,
    editorName: 'Watcher',
    recordSettlementReturn: false
  })
})

test('select-data-source-folder returns null for canceled dialog and data for selected path', async t => {
  let selected = null
  const harness = makeHarness({
    dataService: {
      setDataSource(_app, sourceKey, folderPath) {
        selected = { sourceKey, folderPath }
        return { survivors: folderPath }
      }
    },
    dialog: {
      async showOpenDialog() {
        return { canceled: true, filePaths: [] }
      }
    }
  })
  t.after(() => harness.cleanup())

  const handler = harness.handlers.get('select-data-source-folder')
  const canceledResult = await handler(null, 'survivors')
  assert.equal(canceledResult, null)

  harness.electron.dialog.showOpenDialog = async () => ({
    canceled: false,
    filePaths: ['/tmp/selected-survivors']
  })
  const selectedResult = await handler(null, 'survivors')
  assert.deepEqual(selected, { sourceKey: 'survivors', folderPath: '/tmp/selected-survivors' })
  assert.deepEqual(selectedResult, {
    sourceKey: 'survivors',
    folderPath: '/tmp/selected-survivors',
    dataSources: { survivors: '/tmp/selected-survivors' }
  })
})

test('load-markdown-file handler renders markdown HTML', async t => {
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return { knowledges: '/tmp/knowledges' }
      },
      loadMarkdownFile(_sources, collectionId, fileName) {
        return {
          collectionId,
          folder: '/tmp/knowledges',
          fileName,
          title: 'Lantern Lore',
          markdown: '**Bold** text'
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
  assert.equal(harness.getMarkdownRenderInput(), '**Bold** text')
  assert.equal(result.title, 'Lantern Lore')
  assert.equal(result.html, '<rendered>**Bold** text</rendered>')
})

test('tenet knowledge template handlers require the shared knowledges folder', async t => {
  const calls = []
  const harness = makeHarness({
    dataService: {
      getSavedDataSources() {
        return {
          knowledges: '',
          neuroses: ''
        }
      },
      saveKnowledgeTemplate(folderPath, type, template) {
        calls.push({ folderPath, type, template })
        return 'saved-template.json'
      }
    }
  })
  t.after(() => harness.cleanup())

  const saveHandler = harness.handlers.get('save-knowledge-template')
  const listHandler = harness.handlers.get('list-knowledge-templates')

  assert.throws(() => saveHandler(null, 'tenetKnowledge', { name: 'Tenet 2' }), /No Knowledges folder selected/)
  assert.throws(() => saveHandler(null, 'knowledge', { name: 'Knowledge 2' }), /No Knowledges folder selected/)
  const listResult = await listHandler(null, 'knowledge')
  assert.deepEqual(listResult, [])
  assert.deepEqual(calls, [])
})

test('list-people-summaries handler returns summaries payload', async t => {
  const summaries = {
    records: [{ fileName: 'alice.json', person: { name: 'Alice', isAlive: true }, canPonder: true, statsTotal: 5, traitSearchText: 'dash' }],
    unreadableCount: 0,
    totalFiles: 1
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

test('app settings handlers load and persist app settings', async t => {
  let savedSettings = null
  const harness = makeHarness({
    dataService: {
      getSavedAppSettings() {
        return { userName: 'Archivist', dateFormat: 'en-GB' }
      },
      saveAppSettings(_app, settings) {
        savedSettings = settings
        return {
          userName: String(settings.userName || '').trim(),
          dateFormat: settings.dateFormat === 'en-US' ? 'en-US' : 'en-GB'
        }
      }
    }
  })
  t.after(() => harness.cleanup())

  const getHandler = harness.handlers.get('get-app-settings')
  const saveHandler = harness.handlers.get('save-app-settings')

  assert.deepEqual(await getHandler(), { userName: 'Archivist', dateFormat: 'en-GB' })
  assert.deepEqual(await saveHandler(null, { userName: '  Mike  ', dateFormat: 'en-US' }), { userName: 'Mike', dateFormat: 'en-US' })
  assert.deepEqual(savedSettings, { userName: '  Mike  ', dateFormat: 'en-US' })
})

test('packaged runtime rejects Local Files settings and reports production mode', async t => {
  const harness = makeHarness({ app: { isPackaged: true } })
  t.after(() => harness.cleanup())
  const runtimeHandler = harness.handlers.get('get-runtime-info')
  const saveHandler = harness.handlers.get('save-app-settings')

  assert.deepEqual(await runtimeHandler(), { isDevelopmentMode: false })
  await assert.rejects(
    () => saveHandler(null, { survivorDataMode: 'local' }),
    /only available through npm run dev/
  )
})

test('full-screen handlers report and toggle window state', async t => {
  const harness = makeHarness()
  t.after(() => harness.cleanup())
  await harness.ready()

  const getStateHandler = harness.handlers.get('get-full-screen-state')
  const toggleHandler = harness.handlers.get('toggle-full-screen')
  const windowRef = harness.electron.BrowserWindow.instances[0]

  assert.deepEqual(await getStateHandler(), { isFullScreen: false })

  const toggledOn = await toggleHandler()
  assert.deepEqual(toggledOn, { isFullScreen: true })
  assert.equal(windowRef.isFullScreen(), true)
  assert.deepEqual(windowRef.sentMessages.at(-1), {
    channel: 'window-full-screen-changed',
    args: [true]
  })

  const toggledOff = await toggleHandler()
  assert.deepEqual(toggledOff, { isFullScreen: false })
  assert.equal(windowRef.isFullScreen(), false)
  assert.deepEqual(windowRef.sentMessages.at(-1), {
    channel: 'window-full-screen-changed',
    args: [false]
  })
})
