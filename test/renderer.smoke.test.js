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
    this.owner._className = [...this.values].join(' ')
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

function splitSelectorList(selector) {
  return String(selector || '')
    .split(',')
    .map(token => token.trim())
    .filter(Boolean)
}

function normalizeDataAttributeName(name) {
  return String(name || '')
    .replace(/^data-/, '')
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

function parseCompoundSelector(selector) {
  const value = String(selector || '').trim()
  if (!value || value.includes(' ')) return null

  let index = 0
  let tagName = null
  const classes = []
  const attributes = []

  while (index < value.length && /[a-z0-9_-]/i.test(value[index])) {
    index += 1
  }
  if (index > 0) tagName = value.slice(0, index).toUpperCase()

  while (index < value.length) {
    const token = value[index]
    if (token === '.') {
      index += 1
      const start = index
      while (index < value.length && /[a-z0-9_-]/i.test(value[index])) index += 1
      if (index > start) classes.push(value.slice(start, index))
      continue
    }
    if (token === '[') {
      const end = value.indexOf(']', index)
      if (end === -1) return null
      const rawContent = value.slice(index + 1, end).trim()
      const equalsIndex = rawContent.indexOf('=')
      if (equalsIndex === -1) {
        attributes.push({ name: rawContent, value: null })
      } else {
        const name = rawContent.slice(0, equalsIndex).trim()
        const rawValue = rawContent.slice(equalsIndex + 1).trim()
        const normalizedValue =
          rawValue.startsWith('"') && rawValue.endsWith('"')
            ? rawValue.slice(1, -1)
            : rawValue.startsWith("'") && rawValue.endsWith("'")
              ? rawValue.slice(1, -1)
              : rawValue
        attributes.push({ name, value: normalizedValue })
      }
      index = end + 1
      continue
    }
    return null
  }

  return { tagName, classes, attributes }
}

function matchesCompoundSelector(element, selector) {
  const parsed = parseCompoundSelector(selector)
  if (!parsed) return false
  if (parsed.tagName && element.tagName !== parsed.tagName) return false
  for (const className of parsed.classes) {
    if (!element.classList.contains(className)) return false
  }
  for (const attribute of parsed.attributes) {
    if (attribute.name.startsWith('data-')) {
      const key = normalizeDataAttributeName(attribute.name)
      if (!Object.prototype.hasOwnProperty.call(element.dataset, key)) return false
      if (attribute.value !== null && String(element.dataset[key]) !== attribute.value) return false
      continue
    }
    const actual = element.getAttribute(attribute.name)
    if (actual === null) return false
    if (attribute.value !== null && actual !== attribute.value) return false
  }
  return true
}

function findMatchingDescendants(root, selector) {
  const matches = []
  for (const child of root.children) {
    if (!(child instanceof FakeElement)) continue
    if (child.matches(selector)) matches.push(child)
    matches.push(...findMatchingDescendants(child, selector))
  }
  return matches
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
    this._className = ''
    this.dataset = {}
    this.style = {}
    this.parentElement = null
    this.children = []
    this.attributes = new Map()
    this.listeners = new Map()
    this.classList = new FakeClassList(this)
    this._innerHtml = ''
    this._selectedIndex = -1
  }

  get options() {
    return this.children.filter(child => child.tagName === 'OPTION')
  }

  get className() {
    return this._className
  }

  set className(value) {
    const stringValue = String(value ?? '')
    this._className = stringValue
    this.classList.values = new Set(stringValue.split(/\s+/).filter(Boolean))
  }

  get selectedIndex() {
    if (this.tagName !== 'SELECT') return this._selectedIndex
    return this.options.findIndex(option => option.value === this.value)
  }

  set selectedIndex(index) {
    if (this.tagName !== 'SELECT') {
      this._selectedIndex = Number(index)
      return
    }
    const normalizedIndex = Number(index)
    const option = Number.isInteger(normalizedIndex) ? this.options[normalizedIndex] : null
    this.value = option ? option.value : ''
    this._selectedIndex = option ? normalizedIndex : -1
  }

  get innerHTML() {
    return this._innerHtml
  }

  set innerHTML(value) {
    this._innerHtml = String(value ?? '')
    this.children = []
    if (this.tagName === 'SELECT') {
      this.value = ''
      this._selectedIndex = -1
    }
  }

  setAttribute(name, value) {
    const key = String(name)
    const stringValue = String(value)
    this.attributes.set(key, stringValue)
    if (key === 'id') this.id = stringValue
    if (key === 'class') this.className = stringValue
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
    if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
      const optionIndex = this.options.length - 1
      if (child.selected) {
        this.value = child.value
        this._selectedIndex = optionIndex
      } else if (!this.value) {
        this.value = child.value
        this._selectedIndex = optionIndex
      }
    }
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

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null
  }

  querySelectorAll(selector) {
    const selectors = splitSelectorList(selector)
    if (selectors.length === 0) return []
    const results = []
    for (const candidate of selectors.flatMap(entry => findMatchingDescendants(this, entry))) {
      if (!results.includes(candidate)) results.push(candidate)
    }
    return results
  }

  closest(selector) {
    let current = this
    while (current instanceof FakeElement) {
      if (current.matches(selector)) return current
      current = current.parentElement
    }
    return null
  }

  matches(selector) {
    const selectors = splitSelectorList(selector)
    if (selectors.length === 0) return false
    return selectors.some(entry => matchesCompoundSelector(this, entry))
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
    this.body.appendChild(this._workspace)
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
    this.body.appendChild(element)
    if (this.onCreateId) this.onCreateId(key, element)
    return element
  }

  querySelector(selector) {
    if (selector === '.workspace') return this._workspace
    return this.body.querySelector(selector)
  }

  querySelectorAll(selector) {
    if (selector === '.workspace') return [this._workspace]
    return this.body.querySelectorAll(selector)
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

function seedRendererQueryElements(document) {
  const makeElement = (tagName, configure) => {
    const element = document.createElement(tagName)
    if (typeof configure === 'function') configure(element)
    document.body.appendChild(element)
    return element
  }

  ;['isAlive', 'lifetimeReroll', 'canPonder'].forEach(name => {
    makeElement('select', element => {
      element.dataset.boolFilter = name
      element.value = name === 'isAlive' ? 'yes' : 'all'
    })
  })

  ;['courageGroup', 'understandingGroup'].forEach(name => {
    makeElement('select', element => {
      element.dataset.triadFilter = name
      element.value = 'any'
    })
  })

  ;[
    'name',
    'age',
    'lumi',
    'survivalPts',
    'insanityPts',
    'philosophy',
    'philosophyRank',
    'canPonder',
    'movement',
    'speed',
    'accuracy',
    'strength',
    'luck',
    'evasion',
    'courage',
    'understanding',
    'weaponProficiency.type',
    'weaponProficiency.level',
    'lastUpdated',
    'lastReturned',
    'statsTotal'
  ].forEach(sortKey => {
    makeElement('button', element => {
      element.classList.add('settlement-sort')
      element.dataset.sortKey = sortKey
    })
  })
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
                lifetimeReroll: person.lifetimeReroll,
                matchmaker: person.matchmaker,
                tinker: person.tinker,
                weaponProficiency: {
                  type: person.weaponProficiency?.type || '',
                  level: person.weaponProficiency?.level || 0
                }
              },
              canPonder: Number(person.age) >= Number(person.nextPhilosophyAgeThreshold),
              statsTotal:
                Number(person.movement || 0) +
                Number(person.speed || 0) +
                Number(person.accuracy || 0) +
                Number(person.strength || 0) +
                Number(person.luck || 0) +
                Number(person.evasion || 0),
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
  seedRendererQueryElements(fakeDocument)
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
    HTMLButtonElement: global.HTMLButtonElement,
    HTMLInputElement: global.HTMLInputElement,
    HTMLTextAreaElement: global.HTMLTextAreaElement,
    HTMLSelectElement: global.HTMLSelectElement,
    Event: global.Event
  }

  global.window = fakeWindow
  global.document = fakeDocument
  global.Element = FakeElement
  global.HTMLElement = FakeElement
  global.HTMLButtonElement = FakeElement
  global.HTMLInputElement = FakeElement
  global.HTMLTextAreaElement = FakeElement
  global.HTMLSelectElement = FakeElement
  global.Event = FakeEvent

  const knowledgeHelperPath = path.join(__dirname, '..', 'src', 'rendererKnowledgeTemplateHelpers.js')
  const settlementHelperPath = path.join(__dirname, '..', 'src', 'rendererSettlementHelpers.js')
  const rendererPath = path.join(__dirname, '..', 'src', 'renderer.js')
  delete require.cache[knowledgeHelperPath]
  delete require.cache[settlementHelperPath]
  delete require.cache[rendererPath]
  require(knowledgeHelperPath)
  require(settlementHelperPath)
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
    dispatch(element, type, init = {}) {
      element.dispatchEvent(new FakeEvent(type, { ...init, target: init.target || element }))
    },
    cleanup() {
      fakeWindow.cleanup()
      delete require.cache[knowledgeHelperPath]
      delete require.cache[settlementHelperPath]
      delete require.cache[rendererPath]
      for (const key of assignedGlobalIds) {
        delete global[key]
      }
      global.window = previousGlobals.window
      global.document = previousGlobals.document
      global.Element = previousGlobals.Element
      global.HTMLElement = previousGlobals.HTMLElement
      global.HTMLButtonElement = previousGlobals.HTMLButtonElement
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

test('editing an existing survivor rename removes the old settlement record', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const settlementTableBody = harness.document.getElementById('settlementTableBody')
  const createView = harness.document.getElementById('createSurvivorView')
  const nameInput = harness.document.getElementById('createSurvivorName')
  const peopleList = harness.document.getElementById('peopleList')
  const aliceRow = settlementTableBody.children.find(child => child.dataset.fileName === 'alice.json')

  assert.ok(aliceRow)

  harness.dispatch(settlementTableBody, 'click', { target: aliceRow })
  await harness.flush(12)

  assert.ok(!createView.classList.contains('hidden'))
  assert.equal(nameInput.value, 'Alice')

  nameInput.value = 'Alicia'
  harness.dispatch(createView, 'input', { target: nameInput })
  await harness.flush()

  harness.click('createSurvivorSubmit')
  await harness.flush(16)

  assert.equal(harness.db['alice.json'], undefined)
  assert.equal(harness.db['alicia.json']?.name, 'Alicia')
  assert.equal(peopleList.value, 'alicia.json')
  assert.ok(harness.calls.some(call => call.name === 'deletePerson' && call.args[0] === 'alice.json'))
})

test('departed showdown keeps locked slot selections when selectors change', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const status = harness.document.getElementById('status')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()
  harness.click('departShowdown')
  await harness.flush()

  assert.equal(showdownSelectA.disabled, true)
  assert.equal(showdownSelectB.disabled, true)

  showdownSelectA.value = 'bob.json'
  harness.dispatch(showdownSelectA, 'change')
  await harness.flush()

  assert.equal(showdownSelectA.value, 'alice.json')
  assert.equal(showdownSelectB.value, 'bob.json')
  assert.match(status.innerText, /Showdown slots are locked while departed/)
})

test('create knowledge upgrade applies the configured next template', async t => {
  const harness = setupRendererHarness({
    customizeApi(api) {
      api.createPersonTemplate = async name =>
        makePerson(name, {
          knowledge: [
            {
              name: 'Inner Lantern',
              observation: 'Current observation',
              rules: 'Current rules',
              observationRequirement: 2,
              currentObservations: 2,
              knowledgeLevel: 1,
              nextKnowledgeMode: 'existingTemplate',
              nextKnowledgeTemplate: 'inner-lantern-l2.json'
            }
          ]
        })
      api.listKnowledgeTemplates = async type => {
        if (type !== 'knowledge') return []
        return [
          {
            fileName: 'inner-lantern-l2.json',
            name: 'Inner Lantern II',
            template: {
              name: 'Inner Lantern II',
              observation: 'Upgraded observation',
              rules: 'Upgraded rules',
              observationRequirement: 4,
              knowledgeLevel: 2,
              nextKnowledgeMode: 'maxLevel',
              nextKnowledgeTemplate: ''
            }
          }
        ]
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  harness.click('navCreate')
  await harness.flush(12)

  const createView = harness.document.getElementById('createSurvivorView')
  const createKnowledge = harness.document.getElementById('createKnowledge')
  const status = harness.document.getElementById('status')
  let knowledgeRow = createKnowledge.querySelector('.ve-row')

  assert.ok(knowledgeRow)

  const upgradeButton = knowledgeRow.querySelector('[data-action="upgradeKnowledgeRow"]')
  assert.ok(upgradeButton)
  assert.ok(!upgradeButton.classList.contains('hidden'))

  harness.dispatch(createView, 'click', { target: upgradeButton })
  await harness.flush(16)

  knowledgeRow = createKnowledge.querySelector('.ve-row')
  assert.equal(knowledgeRow.querySelector('[data-field="name"]').value, 'Inner Lantern II')
  assert.equal(knowledgeRow.querySelector('[data-field="knowledgeLevel"]').value, '2')
  assert.equal(knowledgeRow.querySelector('[data-field="currentObservations"]').value, '0')
  assert.equal(knowledgeRow.querySelector('[data-field="nextKnowledgeMode"]').value, 'maxLevel')
  assert.match(status.innerText, /Upgraded Inner Lantern from next template/)
})

test('showdown knowledge upgrade applies the configured next template before save', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      context.db['alice.json'] = makePerson('Alice', {
        knowledge: [
          {
            name: 'Inner Lantern',
            observation: 'Current observation',
            rules: 'Current rules',
            observationRequirement: 2,
            currentObservations: 2,
            knowledgeLevel: 1,
            nextKnowledgeMode: 'existingTemplate',
            nextKnowledgeTemplate: 'inner-lantern-l2.json'
          }
        ]
      })
      api.listKnowledgeTemplates = async type => {
        if (type !== 'knowledge') return []
        return [
          {
            fileName: 'inner-lantern-l2.json',
            name: 'Inner Lantern II',
            template: {
              name: 'Inner Lantern II',
              observation: 'Upgraded observation',
              rules: 'Upgraded rules',
              observationRequirement: 4,
              knowledgeLevel: 2,
              nextKnowledgeMode: 'maxLevel',
              nextKnowledgeTemplate: ''
            }
          }
        ]
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const showdownView = harness.document.getElementById('showdownView')
  const status = harness.document.getElementById('status')
  const upgradeButton = harness.document.createElement('button')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush(12)

  upgradeButton.dataset.showdownUpgradeSlot = 'A'
  upgradeButton.dataset.showdownUpgradeArray = 'knowledge'
  upgradeButton.dataset.showdownUpgradeIndex = '0'
  showdownView.dispatchEvent(new FakeEvent('click', { target: upgradeButton }))
  await harness.flush(16)

  assert.match(status.innerText, /Upgraded Inner Lantern from next template/)

  harness.click('departShowdown')
  await harness.flush()
  harness.click('showdownOver')
  await harness.flush(16)

  assert.equal(harness.db['alice.json']?.knowledge?.[0]?.name, 'Inner Lantern II')
  assert.equal(harness.db['alice.json']?.knowledge?.[0]?.knowledgeLevel, 2)
  assert.equal(harness.db['alice.json']?.knowledge?.[0]?.currentObservations, 0)
})

test('settlement sort covers newer and derived columns', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      context.db['alice.json'] = makePerson('Alice', {
        movement: 6,
        speed: 1,
        accuracy: 0,
        strength: 2,
        luck: 0,
        evasion: 1,
        courage: 0,
        understanding: 0,
        weaponProficiency: { type: 'Sword', level: 2, isSpecialist: false, isMaster: false }
      })
      context.db['bob.json'] = makePerson('Bob', {
        movement: 5,
        speed: 0,
        accuracy: 0,
        strength: 0,
        luck: 0,
        evasion: 0,
        courage: 9,
        understanding: 9,
        weaponProficiency: { type: 'Axe', level: 1, isSpecialist: false, isMaster: false }
      })
      context.db['cara.json'] = makePerson('Cara', {
        movement: 7,
        speed: 2,
        accuracy: 1,
        strength: 2,
        luck: 1,
        evasion: 1,
        courage: 1,
        understanding: 1,
        weaponProficiency: { type: 'Whip', level: 4, isSpecialist: false, isMaster: false }
      })
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const settlementTableBody = harness.document.getElementById('settlementTableBody')
  const sortButtons = harness.document.querySelectorAll('.settlement-sort')
  const getRowNames = () => settlementTableBody.children.map(row => row.dataset.fileName)
  const clickSort = sortKey => {
    const button = sortButtons.find(entry => entry.dataset.sortKey === sortKey)
    assert.ok(button, `missing sort button for ${sortKey}`)
    harness.dispatch(button, 'click')
  }

  assert.deepEqual(getRowNames(), ['cara.json', 'bob.json', 'alice.json'])

  clickSort('weaponProficiency.type')
  await harness.flush()
  assert.deepEqual(getRowNames(), ['cara.json', 'alice.json', 'bob.json'])

  clickSort('weaponProficiency.level')
  await harness.flush()
  assert.deepEqual(getRowNames(), ['cara.json', 'alice.json', 'bob.json'])

  clickSort('statsTotal')
  await harness.flush()
  assert.deepEqual(getRowNames(), ['cara.json', 'alice.json', 'bob.json'])

  clickSort('statsTotal')
  await harness.flush()
  assert.deepEqual(getRowNames(), ['bob.json', 'alice.json', 'cara.json'])
})

test('settlement filters combine alive, can ponder, and ability group rules', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      context.db['alice.json'] = makePerson('Alice', {
        isAlive: true,
        age: 3,
        nextPhilosophyAgeThreshold: 3,
        philosophy: '',
        lifetimeReroll: true,
        matchmaker: true,
        tinker: false
      })
      context.db['bob.json'] = makePerson('Bob', {
        isAlive: true,
        age: 4,
        nextPhilosophyAgeThreshold: 6,
        lifetimeReroll: false,
        matchmaker: false,
        tinker: true
      })
      context.db['cara.json'] = makePerson('Cara', {
        isAlive: false,
        age: 5,
        nextPhilosophyAgeThreshold: 5,
        lifetimeReroll: true,
        matchmaker: false,
        tinker: false
      })
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const settlementCount = harness.document.getElementById('settlementCount')
  const boolFilters = harness.document.querySelectorAll('[data-bool-filter]')
  const triadFilters = harness.document.querySelectorAll('[data-triad-filter]')
  const aliveFilter = boolFilters.find(entry => entry.dataset.boolFilter === 'isAlive')
  const ponderFilter = boolFilters.find(entry => entry.dataset.boolFilter === 'canPonder')
  const rerollFilter = boolFilters.find(entry => entry.dataset.boolFilter === 'lifetimeReroll')
  const courageGroupFilter = triadFilters.find(entry => entry.dataset.triadFilter === 'courageGroup')
  const understandingGroupFilter = triadFilters.find(entry => entry.dataset.triadFilter === 'understandingGroup')

  assert.equal(settlementCount.textContent, '2 of 3 survivors shown')

  ponderFilter.value = 'yes'
  harness.dispatch(ponderFilter, 'change')
  await harness.flush()
  assert.equal(settlementCount.textContent, '1 of 3 survivors shown')

  courageGroupFilter.value = 'matchmaker'
  harness.dispatch(courageGroupFilter, 'change')
  await harness.flush()
  assert.equal(settlementCount.textContent, '1 of 3 survivors shown')

  rerollFilter.value = 'yes'
  harness.dispatch(rerollFilter, 'change')
  await harness.flush()
  assert.equal(settlementCount.textContent, '1 of 3 survivors shown')

  aliveFilter.value = 'all'
  harness.dispatch(aliveFilter, 'change')
  await harness.flush()
  assert.equal(settlementCount.textContent, '1 of 3 survivors shown')

  courageGroupFilter.value = 'any'
  harness.dispatch(courageGroupFilter, 'change')
  await harness.flush()
  assert.equal(settlementCount.textContent, '2 of 3 survivors shown')

  understandingGroupFilter.value = 'tinker'
  harness.dispatch(understandingGroupFilter, 'change')
  await harness.flush()
  assert.equal(settlementCount.textContent, '0 of 3 survivors shown')
})

test('settlement row showdown assignment swaps the other slot when needed', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      context.db['cara.json'] = makePerson('Cara')
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const settlementTableBody = harness.document.getElementById('settlementTableBody')
  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const status = harness.document.getElementById('status')
  const bobRow = settlementTableBody.children.find(row => row.dataset.fileName === 'bob.json')
  const caraRow = settlementTableBody.children.find(row => row.dataset.fileName === 'cara.json')
  const bobSlotOneButton = bobRow.children[bobRow.children.length - 1].children[0]
  const caraSlotTwoButton = caraRow.children[caraRow.children.length - 1].children[1]

  assert.equal(showdownSelectA.value, 'alice.json')
  assert.equal(showdownSelectB.value, 'bob.json')

  harness.dispatch(settlementTableBody, 'click', { target: bobSlotOneButton })
  await harness.flush()

  assert.equal(showdownSelectA.value, 'bob.json')
  assert.equal(showdownSelectB.value, 'alice.json')
  assert.match(status.innerText, /Assigned bob\.json to Survivor A/)

  harness.dispatch(settlementTableBody, 'click', { target: caraSlotTwoButton })
  await harness.flush()

  assert.equal(showdownSelectA.value, 'bob.json')
  assert.equal(showdownSelectB.value, 'cara.json')
  assert.match(status.innerText, /Assigned cara\.json to Survivor B/)
})

test('nav showdown resumes in-memory session from settlement without reloading survivors', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const settlementView = harness.document.getElementById('settlementView')
  const showdownView = harness.document.getElementById('showdownView')
  const status = harness.document.getElementById('status')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  const loadBaseline = countCalls(harness.calls, 'loadPerson')

  harness.click('openShowdown')
  await harness.flush(12)

  const loadAfterOpen = countCalls(harness.calls, 'loadPerson')
  assert.equal(loadAfterOpen, loadBaseline + 2)
  assert.ok(!showdownView.classList.contains('hidden'))

  harness.click('navSettlement')
  await harness.flush()

  assert.ok(!settlementView.classList.contains('hidden'))
  assert.ok(showdownView.classList.contains('hidden'))

  harness.click('navShowdown')
  await harness.flush()

  assert.ok(!showdownView.classList.contains('hidden'))
  assert.equal(countCalls(harness.calls, 'loadPerson'), loadAfterOpen)
  assert.match(status.innerText, /Resumed in-memory showdown session/)
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
  const showdownView = harness.document.getElementById('showdownView')

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
  const lumiButton = harness.document.createElement('button')
  lumiButton.dataset.showdownSlot = 'A'
  lumiButton.dataset.showdownField = 'lumi'
  lumiButton.dataset.showdownKind = 'base'
  lumiButton.dataset.showdownDelta = '1'
  lumiButton.dataset.showdownMin = '0'
  lumiButton.dataset.showdownMax = ''
  showdownView.dispatchEvent(new FakeEvent('click', { target: lumiButton }))
  await harness.flush()
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
  assert.equal(showdownSaves.find(entry => entry.args[1].expectedFileName === 'alice.json')?.args[0]?.lumi, 1)
})
