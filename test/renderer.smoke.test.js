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
  }

  preventDefault() {}

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
    schemaVersion: 1,
    revision: 1,
    updatedAt: new Date().toISOString(),
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

function setupRendererHarness() {
  const calls = []
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
    async listPeople() {
      calls.push({ name: 'listPeople', args: [] })
      return Object.keys(db).sort((a, b) => a.localeCompare(b))
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

  const assignedGlobalIds = new Set()
  const fakeDocument = new FakeDocument((id, element) => {
    if (!/^[$A-Z_][0-9A-Z_$]*$/i.test(id)) return
    if (Object.prototype.hasOwnProperty.call(global, id)) return
    global[id] = element
    assignedGlobalIds.add(id)
  })
  const fakeWindow = new FakeWindow(fakeDocument, api)

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
    calls,
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

function countCalls(calls, name) {
  return calls.filter(entry => entry.name === name).length
}

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
})
