const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')

class FakeClassList {
  constructor(owner) {
    this.owner = owner
    this.values = new Set()
  }

  add(...tokens) {
    for (const token of tokens) {
      if (token) this.values.add(String(token))
    }
    this._sync()
  }

  remove(...tokens) {
    for (const token of tokens) {
      this.values.delete(String(token))
    }
    this._sync()
  }

  toggle(token, force) {
    const key = String(token)
    if (force === true) {
      this.values.add(key)
      this._sync()
      return true
    }
    if (force === false) {
      this.values.delete(key)
      this._sync()
      return false
    }
    if (this.values.has(key)) {
      this.values.delete(key)
      this._sync()
      return false
    }
    this.values.add(key)
    this._sync()
    return true
  }

  contains(token) {
    return this.values.has(String(token))
  }

  _sync() {
    this.owner.className = [...this.values].join(' ')
  }
}

class FakeEvent {
  constructor(type, init = {}) {
    this.type = String(type)
    this.target = init.target || null
    this.key = init.key
    this.deltaX = Number(init.deltaX || 0)
    this.deltaY = Number(init.deltaY || 0)
    this.defaultPrevented = false
  }

  preventDefault() {
    this.defaultPrevented = true
  }

  stopPropagation() {}
}

class FakeElement {
  constructor(ownerDocument, tagName = 'div') {
    this.ownerDocument = ownerDocument
    this.tagName = String(tagName || 'div').toUpperCase()
    this.id = ''
    this.value = ''
    this.checked = false
    this.disabled = false
    this.textContent = ''
    this.innerText = ''
    this.className = ''
    this.dataset = {}
    this.style = {}
    this.parentElement = null
    this.children = []
    this.attributes = new Map()
    this.listeners = new Map()
    this.classList = new FakeClassList(this)
    this._innerHtml = ''
  }

  get options() {
    return this.children.filter(child => child.tagName === 'OPTION')
  }

  get innerHTML() {
    return this._innerHtml
  }

  set innerHTML(value) {
    this._innerHtml = String(value ?? '')
    this.children = []
  }

  setAttribute(name, value) {
    const key = String(name)
    const stringValue = String(value)
    this.attributes.set(key, stringValue)
    if (key === 'id') this.id = stringValue
    if (key === 'class') {
      this.className = stringValue
      this.classList = new FakeClassList(this)
      for (const token of stringValue.split(/\s+/).filter(Boolean)) {
        this.classList.add(token)
      }
    }
  }

  getAttribute(name) {
    const key = String(name)
    if (!this.attributes.has(key)) return null
    return this.attributes.get(key)
  }

  appendChild(child) {
    if (!(child instanceof FakeElement)) return child
    child.parentElement = this
    this.children.push(child)
    return child
  }

  append(...nodes) {
    for (const node of nodes) {
      if (node instanceof FakeElement) {
        this.appendChild(node)
      } else {
        const textNode = this.ownerDocument.createElement('span')
        textNode.textContent = String(node)
        this.appendChild(textNode)
      }
    }
  }

  querySelector() {
    return null
  }

  querySelectorAll() {
    return []
  }

  closest() {
    return null
  }

  matches(selector) {
    const selectors = String(selector || '')
      .split(',')
      .map(token => token.trim().toUpperCase())
      .filter(Boolean)
    if (selectors.length === 0) return false
    return selectors.includes(this.tagName)
  }

  addEventListener(type, listener) {
    const key = String(type)
    const list = this.listeners.get(key) || []
    list.push(listener)
    this.listeners.set(key, list)
  }

  dispatchEvent(event) {
    if (!event || typeof event.type !== 'string') return false
    if (!event.target) event.target = this
    const list = this.listeners.get(event.type) || []
    for (const listener of list) listener(event)
    return true
  }

  focus() {}

  setSelectionRange() {}
}

class FakeWindow {
  constructor(document, api) {
    this.document = document
    this.api = api
    this._timers = new Set()
    this._listeners = new Map()
    this.confirm = () => true
    this.alert = () => {}
    this.localStorage = {
      getItem: key => this._storage.get(String(key)) ?? null,
      setItem: (key, value) => {
        this._storage.set(String(key), String(value))
      },
      removeItem: key => {
        this._storage.delete(String(key))
      }
    }
    this._storage = new Map()
  }

  addEventListener(type, listener) {
    const key = String(type)
    const list = this._listeners.get(key) || []
    list.push(listener)
    this._listeners.set(key, list)
  }

  dispatchEvent(event) {
    const list = this._listeners.get(String(event?.type || '')) || []
    for (const listener of list) listener(event)
  }

  setTimeout(callback, delay, ...args) {
    const timer = setTimeout(() => {
      this._timers.delete(timer)
      callback(...args)
    }, delay)
    this._timers.add(timer)
    return timer
  }

  clearTimeout(timer) {
    clearTimeout(timer)
    this._timers.delete(timer)
  }

  requestAnimationFrame(callback) {
    return this.setTimeout(() => callback(Date.now()), 0)
  }

  cancelAnimationFrame(timer) {
    this.clearTimeout(timer)
  }

  cleanup() {
    for (const timer of this._timers) clearTimeout(timer)
    this._timers.clear()
  }
}

class FakeDocument {
  constructor(onCreateId = null) {
    this.elementsById = new Map()
    this.listeners = new Map()
    this.hidden = false
    this.onCreateId = typeof onCreateId === 'function' ? onCreateId : null
    this.body = this.createElement('body')
    this._workspace = this.createElement('section')
    this._workspace.classList.add('workspace')
  }

  createElement(tagName) {
    return new FakeElement(this, tagName)
  }

  getElementById(id) {
    const key = String(id)
    if (this.elementsById.has(key)) return this.elementsById.get(key)
    const element = this.createElement('div')
    element.id = key
    this.elementsById.set(key, element)
    if (this.onCreateId) this.onCreateId(key, element)
    return element
  }

  querySelector(selector) {
    if (selector === '.workspace') return this._workspace
    return null
  }

  querySelectorAll() {
    return []
  }

  addEventListener(type, listener) {
    const key = String(type)
    const list = this.listeners.get(key) || []
    list.push(listener)
    this.listeners.set(key, list)
  }

  dispatchEvent(event) {
    if (!event || typeof event.type !== 'string') return false
    if (!event.target) event.target = this
    const list = this.listeners.get(event.type) || []
    for (const listener of list) listener(event)
    return true
  }

  hasFocus() {
    return false
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function makePerson(name, overrides = {}) {
  return {
    name,
    schemaVersion: 3,
    revision: 1,
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    lastReturned: null,
    editedBy: '',
    gender: 'F',
    age: 0,
    isAlive: true,
    ageRank: 0,
    philosophyRank: 0,
    nextPhilosophyAgeThreshold: 0,
    philosophy: '',
    philosophyNeurosis: '',
    philosophyNeurosisName: '',
    philosophyTenet: '',
    lumi: 0,
    survivalPts: 0,
    insanityPts: 0,
    systemicPressurePts: 0,
    tormentPts: 0,
    movement: 5,
    speed: 0,
    accuracy: 0,
    strength: 0,
    luck: 0,
    evasion: 0,
    weaponProficiency: {
      type: '',
      level: 0,
      isSpecialist: false,
      isMaster: false
    },
    courage: 0,
    understanding: 0,
    lifetimeReroll: false,
    matchmaker: false,
    tinker: false,
    abilities: [],
    impairments: [],
    notes: [],
    fightingArts: [],
    secretFightingArts: [],
    disorders: [],
    tenetKnowledge: [],
    knowledge: [],
    ...overrides
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function setupRendererHarness(options = {}) {
  const calls = []
  const confirms = []
  let fullScreen = false
  const fullScreenListeners = new Set()
  const alerts = []
  let appSettings = { userName: 'Lantern Mike', dateFormat: 'en-GB' }
  const db = {
    'alice.json': makePerson('Alice'),
    'bob.json': makePerson('Bob')
  }

  const api = {
    async selectDataSourceFolder() {
      calls.push({ name: 'selectDataSourceFolder', args: [] })
      return null
    },
    async getSavedDataSources() {
      calls.push({ name: 'getSavedDataSources', args: [] })
      return {
        survivors: '/tmp/survivors',
        defaultSurvivorTemplates: '/tmp/default-survivors',
        fightingArts: '',
        secretFightingArts: '',
        knowledges: '',
        tenetKnowledges: '',
        neuroses: '',
        disorders: ''
      }
    },
    async getAppSettings() {
      calls.push({ name: 'getAppSettings', args: [] })
      return deepClone(appSettings)
    },
    async saveAppSettings(settings) {
      calls.push({ name: 'saveAppSettings', args: [deepClone(settings)] })
      appSettings = {
        userName: String(settings?.userName || '').trim(),
        dateFormat: settings?.dateFormat === 'en-US' ? 'en-US' : 'en-GB'
      }
      return deepClone(appSettings)
    },
    async getFullScreenState() {
      calls.push({ name: 'getFullScreenState', args: [] })
      return { isFullScreen: fullScreen }
    },
    async toggleFullScreen() {
      calls.push({ name: 'toggleFullScreen', args: [] })
      fullScreen = !fullScreen
      for (const listener of fullScreenListeners) listener(fullScreen)
      return { isFullScreen: fullScreen }
    },
    onFullScreenChanged(listener) {
      if (typeof listener !== 'function') return () => {}
      fullScreenListeners.add(listener)
      return () => {
        fullScreenListeners.delete(listener)
      }
    },
    async listPeople() {
      calls.push({ name: 'listPeople', args: [] })
      return Object.keys(db).sort((a, b) => a.localeCompare(b))
    },
    async listPeopleSummaries() {
      calls.push({ name: 'listPeopleSummaries', args: [] })
      return {
        records: Object.keys(db)
          .sort((a, b) => a.localeCompare(b))
          .map(fileName => {
            const person = db[fileName]
            return {
              fileName,
              person: {
                name: person.name,
                age: person.age,
                lumi: person.lumi,
                survivalPts: person.survivalPts,
                insanityPts: person.insanityPts,
                philosophy: person.philosophy,
                philosophyRank: person.philosophyRank,
                movement: person.movement,
                speed: person.speed,
                accuracy: person.accuracy,
                strength: person.strength,
                luck: person.luck,
                evasion: person.evasion,
                courage: person.courage,
                understanding: person.understanding,
                lastUpdated: person.lastUpdated,
                lastReturned: person.lastReturned,
                isAlive: person.isAlive,
                matchmaker: person.matchmaker,
                tinker: person.tinker,
                weaponProficiency: {
                  type: person.weaponProficiency?.type || '',
                  level: person.weaponProficiency?.level || 0
                }
              },
              canPonder:
                String(person.philosophy || '').trim().length > 0 &&
                Number(person.age) >= Number(person.nextPhilosophyAgeThreshold),
              statsTotal:
                Number(person.movement || 0) +
                Number(person.speed || 0) +
                Number(person.accuracy || 0) +
                Number(person.strength || 0) +
                Number(person.luck || 0) +
                Number(person.evasion || 0) +
                Number(person.courage || 0) +
                Number(person.understanding || 0),
              traitSearchText: ''
            }
          }),
        unreadableCount: 0,
        totalFiles: Object.keys(db).length
      }
    },
    async loadPerson(fileName) {
      calls.push({ name: 'loadPerson', args: [fileName] })
      if (!db[fileName]) throw new Error('Person not found')
      return deepClone(db[fileName])
    },
    async savePerson(person, options) {
      calls.push({ name: 'savePerson', args: [deepClone(person), options ? deepClone(options) : undefined] })
      const nextFileName = `${slugify(person?.name || '')}.json`
      if (!nextFileName || nextFileName === '.json') {
        return { ok: false, message: 'Invalid survivor name' }
      }
      const previousFile = String(options?.expectedFileName || '')
      if (previousFile && previousFile !== nextFileName) delete db[previousFile]
      db[nextFileName] = deepClone({ ...person, revision: Number(person?.revision || 0) + 1 })
      return { ok: true, fileName: nextFileName }
    },
    async deletePerson(fileName) {
      calls.push({ name: 'deletePerson', args: [fileName] })
      delete db[fileName]
      return { deleted: true }
    },
    async createPersonTemplate(name) {
      calls.push({ name: 'createPersonTemplate', args: [name] })
      return makePerson(name)
    },
    async saveDefaultCreateTemplate(template) {
      calls.push({ name: 'saveDefaultCreateTemplate', args: [deepClone(template)] })
      return { ok: true, fileName: 'default-new-survivor.json' }
    },
    async loadDefaultCreateTemplate() {
      calls.push({ name: 'loadDefaultCreateTemplate', args: [] })
      return null
    },
    async listMarkdownCollections() {
      calls.push({ name: 'listMarkdownCollections', args: [] })
      return []
    },
    async listMarkdownFiles(collectionId) {
      calls.push({ name: 'listMarkdownFiles', args: [collectionId] })
      return []
    },
    async loadMarkdownFile(collectionId, fileName) {
      calls.push({ name: 'loadMarkdownFile', args: [collectionId, fileName] })
      return {
        collectionId,
        folder: '/tmp',
        fileName,
        title: 'Mock Doc',
        markdown: 'mock',
        html: '<p>mock</p>'
      }
    },
    async saveKnowledgeTemplate(type, template) {
      calls.push({ name: 'saveKnowledgeTemplate', args: [type, deepClone(template)] })
      return { ok: true, fileName: 'knowledge-template.json' }
    },
    async listKnowledgeTemplates(type) {
      calls.push({ name: 'listKnowledgeTemplates', args: [type] })
      return []
    },
    async saveNeurosisTemplate(template) {
      calls.push({ name: 'saveNeurosisTemplate', args: [deepClone(template)] })
      return { ok: true, fileName: 'neurosis-template.json' }
    },
    async listNeurosisTemplates() {
      calls.push({ name: 'listNeurosisTemplates', args: [] })
      return []
    }
  }
  if (typeof options.customizeApi === 'function') {
    options.customizeApi(api, { calls, db })
  }

  const assignedGlobalIds = new Set()
  const fakeDocument = new FakeDocument((id, element) => {
    if (!/^[$A-Z_][0-9A-Z_$]*$/i.test(id)) return
    if (Object.prototype.hasOwnProperty.call(global, id)) return
    global[id] = element
    assignedGlobalIds.add(id)
  })
  const fakeWindow = new FakeWindow(fakeDocument, api)
  fakeWindow.confirm = message => {
    confirms.push(String(message))
    return true
  }
  fakeWindow.alert = message => {
    alerts.push(String(message))
  }
  if (typeof options.customizeWindow === 'function') {
    options.customizeWindow(fakeWindow, { alerts, calls, confirms, db })
  }

  const previousGlobals = {
    window: global.window,
    document: global.document,
    Element: global.Element,
    HTMLElement: global.HTMLElement,
    HTMLInputElement: global.HTMLInputElement,
    HTMLTextAreaElement: global.HTMLTextAreaElement,
    HTMLSelectElement: global.HTMLSelectElement,
    Event: global.Event
  }

  global.window = fakeWindow
  global.document = fakeDocument
  global.Element = FakeElement
  global.HTMLElement = FakeElement
  global.HTMLInputElement = FakeElement
  global.HTMLTextAreaElement = FakeElement
  global.HTMLSelectElement = FakeElement
  global.Event = FakeEvent

  const rendererPath = path.join(__dirname, '..', 'src', 'renderer.js')
  delete require.cache[rendererPath]
  require(rendererPath)
  fakeDocument.dispatchEvent(new FakeEvent('DOMContentLoaded', { target: fakeDocument }))

  return {
    alerts,
    calls,
    confirms,
    db,
    document: fakeDocument,
    async flush(times = 8) {
      for (let i = 0; i < times; i += 1) {
        await new Promise(resolve => setImmediate(resolve))
      }
    },
    click(id) {
      const element = fakeDocument.getElementById(id)
      element.dispatchEvent(new FakeEvent('click', { target: element }))
    },
    cleanup() {
      fakeWindow.cleanup()
      delete require.cache[rendererPath]
      for (const key of assignedGlobalIds) {
        delete global[key]
      }
      global.window = previousGlobals.window
      global.document = previousGlobals.document
      global.Element = previousGlobals.Element
      global.HTMLElement = previousGlobals.HTMLElement
      global.HTMLInputElement = previousGlobals.HTMLInputElement
      global.HTMLTextAreaElement = previousGlobals.HTMLTextAreaElement
      global.HTMLSelectElement = previousGlobals.HTMLSelectElement
      global.Event = previousGlobals.Event
    }
  }
}

test('fullscreen nav button toggles window state and updates label', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const button = harness.document.getElementById('navFullscreen')
  assert.equal(button.textContent, 'Full Screen')
  assert.equal(button.getAttribute('aria-pressed'), 'false')

  harness.click('navFullscreen')
  await harness.flush()

  assert.equal(button.textContent, 'Exit Full Screen')
  assert.equal(button.getAttribute('aria-pressed'), 'true')
  assert.ok(harness.calls.some(call => call.name === 'toggleFullScreen'))
})

test('theme selector updates classes and persists preference', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const selector = harness.document.getElementById('themeSelect')

  assert.equal(selector.value, 'dark')
  assert.ok(harness.document.body.classList.contains('theme-dark'))
  assert.equal(harness.document.body.dataset.theme, 'dark')

  selector.value = 'zen-day'
  selector.dispatchEvent(new FakeEvent('change', { target: selector }))
  await harness.flush()

  assert.equal(selector.value, 'zen-day')
  assert.ok(harness.document.body.classList.contains('theme-zen-day'))
  assert.equal(harness.document.body.dataset.theme, 'zen-day')
  assert.equal(global.window.localStorage.getItem('kdm-theme'), 'zen-day')

  selector.value = 'zen-night'
  selector.dispatchEvent(new FakeEvent('change', { target: selector }))
  await harness.flush()

  assert.equal(selector.value, 'zen-night')
  assert.ok(harness.document.body.classList.contains('theme-zen-night'))
  assert.equal(harness.document.body.dataset.theme, 'zen-night')
  assert.equal(global.window.localStorage.getItem('kdm-theme'), 'zen-night')
})

test('renderer persists app settings including date format', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const dateFormat = harness.document.getElementById('settingsDateFormat')
  const userName = harness.document.getElementById('settingsUserName')
  const saveBefore = countCalls(harness.calls, 'saveAppSettings')

  dateFormat.value = 'en-US'
  userName.value = 'Lantern Mike Updated'
  userName.dispatchEvent(new FakeEvent('change', { target: userName }))
  await harness.flush()

  const saves = harness.calls.slice(saveBefore).filter(entry => entry.name === 'saveAppSettings')
  assert.equal(saves.length, 1)
  assert.deepEqual(saves[0].args[0], { userName: 'Lantern Mike Updated', dateFormat: 'en-US' })
})

test('settlement name search waits briefly before rerendering results', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const search = harness.document.getElementById('settlementNameSearch')
  const count = harness.document.getElementById('settlementCount')

  assert.equal(count.textContent, '2 of 2 survivors shown')

  search.value = 'A'
  search.dispatchEvent(new FakeEvent('input', { target: search }))
  await harness.flush()

  assert.equal(count.textContent, '2 of 2 survivors shown')

  search.value = 'Alice'
  search.dispatchEvent(new FakeEvent('input', { target: search }))
  await new Promise(resolve => setTimeout(resolve, 75))
  await harness.flush()

  assert.equal(count.textContent, '2 of 2 survivors shown')

  await new Promise(resolve => setTimeout(resolve, 120))
  await harness.flush()

  assert.equal(count.textContent, '1 of 2 survivors shown')
})

test('settlement trait search also waits briefly before rerendering results', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      api.listPeopleSummaries = async () => {
        context.calls.push({ name: 'listPeopleSummaries', args: [] })
        return {
          records: [
            {
              fileName: 'alice.json',
              person: { name: 'Alice', isAlive: true, weaponProficiency: { type: '', level: 0 } },
              canPonder: false,
              statsTotal: 0,
              traitSearchText: 'dash lantern math'
            },
            {
              fileName: 'bob.json',
              person: { name: 'Bob', isAlive: true, weaponProficiency: { type: '', level: 0 } },
              canPonder: false,
              statsTotal: 0,
              traitSearchText: 'gloom tooth'
            }
          ],
          unreadableCount: 0,
          totalFiles: 2
        }
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  const search = harness.document.getElementById('settlementTraitSearch')
  const count = harness.document.getElementById('settlementCount')

  assert.equal(count.textContent, '2 of 2 survivors shown')

  search.value = 'lan'
  search.dispatchEvent(new FakeEvent('input', { target: search }))
  await harness.flush()

  assert.equal(count.textContent, '2 of 2 survivors shown')

  await new Promise(resolve => setTimeout(resolve, 170))
  await harness.flush()

  assert.equal(count.textContent, '1 of 2 survivors shown')
})

function countCalls(calls, name) {
  return calls.filter(entry => entry.name === name).length
}

test('create view warns before discarding unsaved survivor changes', async t => {
  const confirmResponses = [false, false, true]
  const harness = setupRendererHarness({
    customizeWindow(fakeWindow, context) {
      fakeWindow.confirm = message => {
        context.confirms.push(String(message))
        return confirmResponses.shift() ?? true
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  harness.click('navCreate')
  await harness.flush()

  const createView = harness.document.getElementById('createSurvivorView')
  const settlementView = harness.document.getElementById('settlementView')
  const nameInput = harness.document.getElementById('createSurvivorName')
  const unsavedIndicator = harness.document.getElementById('createUnsavedIndicator')

  assert.ok(!createView.classList.contains('hidden'))
  assert.ok(settlementView.classList.contains('hidden'))
  assert.ok(unsavedIndicator.classList.contains('hidden'))

  nameInput.value = 'Lantern Ava'
  createView.dispatchEvent(new FakeEvent('input', { target: nameInput }))
  await harness.flush()

  assert.ok(!unsavedIndicator.classList.contains('hidden'))

  harness.click('createSurvivorBack')
  await harness.flush()

  assert.ok(!createView.classList.contains('hidden'))
  assert.ok(settlementView.classList.contains('hidden'))
  assert.equal(nameInput.value, 'Lantern Ava')

  harness.click('resetCreateSurvivor')
  await harness.flush()

  assert.equal(nameInput.value, 'Lantern Ava')
  assert.ok(!unsavedIndicator.classList.contains('hidden'))
  assert.equal(harness.confirms.length, 2)
  assert.match(harness.confirms[0], /unsaved changes/i)
  assert.match(harness.confirms[1], /reset the form/i)

  harness.click('createSurvivorBack')
  await harness.flush()

  assert.ok(createView.classList.contains('hidden'))
  assert.ok(!settlementView.classList.contains('hidden'))
})

test('default template unsaved state clears after save and no longer blocks navigation', async t => {
  const confirmResponses = [false]
  const harness = setupRendererHarness({
    customizeWindow(fakeWindow, context) {
      fakeWindow.confirm = message => {
        context.confirms.push(String(message))
        return confirmResponses.shift() ?? true
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  harness.click('navCreate')
  await harness.flush()
  harness.click('createOpenDefaultTemplate')
  await harness.flush()

  const createView = harness.document.getElementById('createSurvivorView')
  const dataSourcesView = harness.document.getElementById('dataSourcesView')
  const philosophyInput = harness.document.getElementById('createSurvivorPhilosophy')
  const unsavedIndicator = harness.document.getElementById('createUnsavedIndicator')

  philosophyInput.value = 'Lantern Code'
  createView.dispatchEvent(new FakeEvent('input', { target: philosophyInput }))
  await harness.flush()

  assert.ok(!unsavedIndicator.classList.contains('hidden'))

  harness.click('navDataSources')
  await harness.flush()

  assert.ok(createView.classList.contains('hidden') === false)
  assert.ok(dataSourcesView.classList.contains('hidden'))
  assert.equal(harness.confirms.length, 1)
  assert.match(harness.confirms[0], /default new survivor template/i)

  const saveBefore = countCalls(harness.calls, 'saveDefaultCreateTemplate')
  harness.click('createSurvivorSubmit')
  await harness.flush()

  assert.equal(countCalls(harness.calls, 'saveDefaultCreateTemplate'), saveBefore + 1)
  assert.ok(unsavedIndicator.classList.contains('hidden'))

  harness.click('navDataSources')
  await harness.flush()

  assert.ok(!dataSourcesView.classList.contains('hidden'))
  assert.equal(harness.confirms.length, 1)
})

test('showdown end failure keeps session recoverable after partial save', async t => {
  let bobFailureInjected = false
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      api.savePerson = async (person, options) => {
        context.calls.push({ name: 'savePerson', args: [deepClone(person), options ? deepClone(options) : undefined] })
        const nextFileName = `${slugify(person?.name || '')}.json`
        const expectedFileName = String(options?.expectedFileName || '')
        const liveRecord = context.db[expectedFileName]

        if (liveRecord && Number(person?.revision || 0) !== Number(liveRecord?.revision || 0)) {
          return {
            ok: false,
            errorType: 'conflict',
            message: 'Stale survivor revision'
          }
        }

        if (expectedFileName === 'bob.json' && !bobFailureInjected) {
          bobFailureInjected = true
          return {
            ok: false,
            message: 'Simulated Bob failure'
          }
        }

        const saved = deepClone({
          ...person,
          revision: Number(person?.revision || 0) + 1,
          lastReturned: options?.markReturned ? new Date().toISOString() : person?.lastReturned || null
        })
        if (expectedFileName && expectedFileName !== nextFileName) delete context.db[expectedFileName]
        context.db[nextFileName] = saved
        return { ok: true, fileName: nextFileName }
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const status = harness.document.getElementById('status')
  const sessionState = harness.document.getElementById('showdownSessionState')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()

  harness.click('departShowdown')
  await harness.flush()

  harness.click('showdownOver')
  await harness.flush(12)

  assert.equal(sessionState.textContent, 'Session departed')
  assert.match(status.innerText, /Could not end showdown\./)
  assert.match(status.innerText, /Saved Alice\./)
  assert.match(status.innerText, /Bob failed: Simulated Bob failure/)
  assert.equal(harness.alerts.length, 1)
  assert.match(harness.alerts[0], /Showdown remains departed so you can retry safely\./)

  harness.click('showdownOver')
  await harness.flush(12)

  assert.equal(sessionState.textContent, 'Session not departed')
  assert.doesNotMatch(status.innerText, /Could not end showdown\./)
  assert.equal(harness.alerts.length, 1)
  assert.equal(harness.db['alice.json'].revision, 3)
  assert.equal(harness.db['bob.json'].revision, 2)
})

test('showdown end surfaces conflict-specific failure messaging and stays departed', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      api.savePerson = async (person, options) => {
        context.calls.push({ name: 'savePerson', args: [deepClone(person), options ? deepClone(options) : undefined] })
        const expectedFileName = String(options?.expectedFileName || '')
        if (expectedFileName === 'bob.json') {
          return {
            ok: false,
            errorType: 'conflict',
            message: 'Stale survivor revision'
          }
        }
        const nextFileName = `${slugify(person?.name || '')}.json`
        context.db[nextFileName] = deepClone({
          ...person,
          revision: Number(person?.revision || 0) + 1
        })
        return { ok: true, fileName: nextFileName }
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const status = harness.document.getElementById('status')
  const sessionState = harness.document.getElementById('showdownSessionState')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()
  harness.click('departShowdown')
  await harness.flush()

  harness.click('showdownOver')
  await harness.flush(12)

  assert.equal(sessionState.textContent, 'Session departed')
  assert.match(status.innerText, /Saved Alice\./)
  assert.match(status.innerText, /Bob failed with a conflict: Stale survivor revision/)
  assert.equal(harness.alerts.length, 1)
})

test('renderer smoke: load, save, create, and showdown flows invoke API contracts', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush()

  const peopleList = harness.document.getElementById('peopleList')
  const personJson = harness.document.getElementById('personJson')
  const createSurvivorName = harness.document.getElementById('createSurvivorName')
  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')

  const loadBefore = countCalls(harness.calls, 'loadPerson')
  peopleList.value = 'alice.json'
  harness.click('loadPerson')
  await harness.flush()
  assert.ok(countCalls(harness.calls, 'loadPerson') > loadBefore)

  const saveBefore = countCalls(harness.calls, 'savePerson')
  const edited = deepClone(harness.db['alice.json'])
  edited.philosophy = 'Edited Philosophy'
  personJson.value = JSON.stringify(edited, null, 2)
  harness.click('savePerson')
  await harness.flush()
  assert.ok(countCalls(harness.calls, 'savePerson') > saveBefore)

  const createCallStart = harness.calls.length
  createSurvivorName.value = 'Cara'
  harness.click('createSurvivorSubmit')
  await harness.flush()
  const createSaves = harness.calls.slice(createCallStart).filter(entry => entry.name === 'savePerson')
  assert.ok(createSaves.some(entry => entry.args[0]?.name === 'Cara'))

  const showdownCallStart = harness.calls.length
  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()
  const showdownLoads = harness.calls.slice(showdownCallStart).filter(entry => entry.name === 'loadPerson')
  assert.ok(showdownLoads.some(entry => entry.args[0] === 'alice.json'))
  assert.ok(showdownLoads.some(entry => entry.args[0] === 'bob.json'))

  const showdownSaveBaseline = harness.calls.length
  harness.click('departShowdown')
  await harness.flush()
  harness.click('showdownOver')
  await harness.flush()

  const showdownSaves = harness.calls
    .slice(showdownSaveBaseline)
    .filter(
      entry =>
        entry.name === 'savePerson' &&
        entry.args[1] &&
        (entry.args[1].expectedFileName === 'alice.json' || entry.args[1].expectedFileName === 'bob.json')
    )
  assert.ok(showdownSaves.some(entry => entry.args[1].expectedFileName === 'alice.json'))
  assert.ok(showdownSaves.some(entry => entry.args[1].expectedFileName === 'bob.json'))
  assert.ok(showdownSaves.every(entry => entry.args[1].markReturned === true))
})
