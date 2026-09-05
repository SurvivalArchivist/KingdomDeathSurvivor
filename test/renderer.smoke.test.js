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
    this.open = false
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

    const detailsPattern = /<details\b([^>]*)>/gi
    let detailsMatch = detailsPattern.exec(this._innerHtml)
    while (detailsMatch) {
      const attributes = detailsMatch[1] || ''
      const sectionMatch = attributes.match(/data-showdown-section=["']([^"']+)["']/i)
      if (sectionMatch) {
        const details = new FakeElement(this.ownerDocument, 'details')
        details.dataset.showdownSection = sectionMatch[1]
        details.open = /(?:^|\s)open(?:\s|$)/i.test(attributes)
        this.appendChild(details)
      }
      detailsMatch = detailsPattern.exec(this._innerHtml)
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
    id: `survivor-${slugify(name)}`,
    name,
    schemaVersion: 6,
    revision: 1,
    createdAt: new Date().toISOString(),
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

function personFileName(person) {
  const id = slugify(person?.id || '')
  const name = slugify(person?.name || '')
  return id && name ? `${id}_${name}.json` : `${name}.json`
}

function findDbPersonByName(db, name) {
  return Object.values(db).find(person => person?.name === name)
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
  const lanConnectionStatusListeners = new Set()
  const lanSurvivorDataListeners = new Set()
  const lanDiscoveredHostsListeners = new Set()
  const alerts = []
  let appSettings = {
    userName: 'Lantern Mike',
    dateFormat: 'en-GB',
    survivorDataMode: 'lan-client',
    lanDisplayName: 'Remote Player',
    lanHostAddress: '192.168.1.44',
    lanPort: 4567,
    lanAutoReconnect: false,
    lanClientConnected: true,
    lanHostEnabled: false
  }
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
        dateFormat: settings?.dateFormat === 'en-US' ? 'en-US' : 'en-GB',
        survivorDataMode:
          settings?.survivorDataMode === 'lan-host' || settings?.survivorDataMode === 'lan-client'
            ? settings.survivorDataMode
            : 'local',
        lanDisplayName: String(settings?.lanDisplayName || '').trim(),
        lanHostAddress: String(settings?.lanHostAddress || '').trim(),
        lanPort: Number.isInteger(Number(settings?.lanPort)) ? Number(settings.lanPort) : 3765,
        lanAutoReconnect: typeof settings?.lanAutoReconnect === 'boolean' ? settings.lanAutoReconnect : true,
        lanClientConnected: typeof settings?.lanClientConnected === 'boolean' ? settings.lanClientConnected : true,
        lanHostEnabled: typeof settings?.lanHostEnabled === 'boolean' ? settings.lanHostEnabled : false
      }
      return deepClone(appSettings)
    },
    async getLanConnectionStatus() {
      calls.push({ name: 'getLanConnectionStatus', args: [] })
      if (appSettings.survivorDataMode === 'lan-host') {
        return appSettings.lanHostEnabled
          ? { mode: 'lan-host', state: 'hosting', label: 'Hosting', message: 'Hosting survivor data' }
          : { mode: 'lan-host', state: 'offline', label: 'Offline', message: 'LAN host is not enabled' }
      }
      if (appSettings.survivorDataMode === 'lan-client') {
        if (appSettings.lanClientConnected === false) {
          return { mode: 'lan-client', state: 'offline', label: 'Offline', message: 'LAN client is disconnected' }
        }
        return appSettings.lanHostAddress
          ? { mode: 'lan-client', state: 'connected', label: 'Connected', message: 'Connected to LAN host' }
          : { mode: 'lan-client', state: 'offline', label: 'Offline', message: 'LAN host is unavailable' }
      }
      return { mode: 'local', state: 'local', label: 'Local', message: 'Using local survivor files' }
    },
    async getLanHostInfo() {
      calls.push({ name: 'getLanHostInfo', args: [] })
      return {
        running: appSettings.survivorDataMode === 'lan-host' && appSettings.lanHostEnabled,
        port: appSettings.lanPort,
        addresses: ['192.168.1.44'],
        urls: [`http://192.168.1.44:${appSettings.lanPort}`]
      }
    },
    async getLanDiscoveredHosts() {
      calls.push({ name: 'getLanDiscoveredHosts', args: [] })
      return [
        {
          id: '192.168.1.50:4567',
          address: '192.168.1.50',
          port: 4567,
          url: 'http://192.168.1.50:4567',
          displayName: 'Table Host',
          lastSeen: Date.now()
        }
      ]
    },
    async exportSurvivorDataBackup() {
      calls.push({ name: 'exportSurvivorDataBackup', args: [] })
      return { ok: true, backupPath: '/tmp/kdm-survivor-backup-test' }
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
    onLanConnectionStatusChanged(listener) {
      if (typeof listener !== 'function') return () => {}
      lanConnectionStatusListeners.add(listener)
      return () => {
        lanConnectionStatusListeners.delete(listener)
      }
    },
    onLanSurvivorDataChanged(listener) {
      if (typeof listener !== 'function') return () => {}
      lanSurvivorDataListeners.add(listener)
      return () => {
        lanSurvivorDataListeners.delete(listener)
      }
    },
    onLanDiscoveredHostsChanged(listener) {
      if (typeof listener !== 'function') return () => {}
      lanDiscoveredHostsListeners.add(listener)
      return () => {
        lanDiscoveredHostsListeners.delete(listener)
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
      const nextFileName = personFileName(person)
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
    async getSettlementRecord() {
      return { knowledges: [] }
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
  const showdownStatePath = path.join(__dirname, '..', 'src', 'rendererShowdownState.js')
  const showdownViewPath = path.join(__dirname, '..', 'src', 'rendererShowdownView.js')
  const showdownControllerPath = path.join(__dirname, '..', 'src', 'rendererShowdownController.js')
  const showdownSessionPath = path.join(__dirname, '..', 'src', 'rendererShowdownSession.js')
  const rendererPath = path.join(__dirname, '..', 'src', 'renderer.js')
  delete require.cache[knowledgeHelperPath]
  delete require.cache[settlementHelperPath]
  delete require.cache[showdownStatePath]
  delete require.cache[showdownViewPath]
  delete require.cache[showdownControllerPath]
  delete require.cache[showdownSessionPath]
  delete require.cache[rendererPath]
  require(knowledgeHelperPath)
  require(settlementHelperPath)
  require(showdownStatePath)
  require(showdownViewPath)
  require(showdownControllerPath)
  require(showdownSessionPath)
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
    emitLanConnectionStatusChanged(payload) {
      for (const listener of lanConnectionStatusListeners) listener(payload)
    },
    emitLanSurvivorDataChanged(payload) {
      for (const listener of lanSurvivorDataListeners) listener(payload)
    },
    emitLanDiscoveredHostsChanged(payload) {
      for (const listener of lanDiscoveredHostsListeners) listener(payload)
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
  assert.deepEqual(saves[0].args[0], {
    userName: 'Lantern Mike Updated',
    dateFormat: 'en-US',
    survivorDataMode: 'lan-client',
    lanDisplayName: 'Remote Player',
    lanHostAddress: '192.168.1.44',
    lanPort: 4567,
    lanAutoReconnect: false,
    lanClientConnected: true,
    lanHostEnabled: false
  })
})

test('renderer persists survivor data LAN settings from settings controls', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const mode = harness.document.getElementById('settingsSurvivorDataMode')
  const displayName = harness.document.getElementById('settingsLanDisplayName')
  const hostAddress = harness.document.getElementById('settingsLanHostAddress')
  const port = harness.document.getElementById('settingsLanPort')
  const autoReconnect = harness.document.getElementById('settingsLanAutoReconnect')
  const hostEnabled = harness.document.getElementById('settingsLanHostEnabled')
  const survivorSourceRow = harness.document.getElementById('survivorSourceRow')
  const saveBefore = countCalls(harness.calls, 'saveAppSettings')

  assert.equal(mode.value, 'lan-client')
  assert.equal(displayName.value, 'Remote Player')
  assert.equal(hostAddress.value, '192.168.1.44')
  assert.equal(port.value, '4567')
  assert.equal(autoReconnect.checked, false)
  assert.equal(survivorSourceRow.hidden, true)

  mode.value = 'lan-host'
  displayName.value = 'Table Host'
  hostAddress.value = ''
  port.value = '3766'
  autoReconnect.checked = true
  hostEnabled.checked = true
  mode.dispatchEvent(new FakeEvent('change', { target: mode }))
  await harness.flush()

  const saves = harness.calls.slice(saveBefore).filter(entry => entry.name === 'saveAppSettings')
  assert.equal(saves.length, 1)
  assert.deepEqual(saves[0].args[0], {
    userName: 'Lantern Mike',
    dateFormat: 'en-GB',
    survivorDataMode: 'lan-host',
    lanDisplayName: 'Table Host',
    lanHostAddress: '',
    lanPort: 3766,
    lanAutoReconnect: true,
    lanClientConnected: true,
    lanHostEnabled: true
  })
  assert.equal(survivorSourceRow.hidden, false)
})

test('renderer enables survivor workflows for LAN client without local survivor folder', async t => {
  const harness = setupRendererHarness({
    customizeApi(api) {
      api.getSavedDataSources = async () => ({
        survivors: '',
        defaultSurvivorTemplates: '/tmp/default-survivors',
        fightingArts: '',
        secretFightingArts: '',
        knowledges: '',
        neuroses: '',
        disorders: ''
      })
    }
  })
  t.after(() => harness.cleanup())

  await harness.flush()

  const survivorSourceRow = harness.document.getElementById('survivorSourceRow')
  const refreshPeople = harness.document.getElementById('refreshPeople')
  const createSubmit = harness.document.getElementById('createSurvivorSubmit')
  const listCalls = harness.calls.filter(entry => entry.name === 'listPeople')

  assert.equal(survivorSourceRow.hidden, true)
  assert.equal(refreshPeople.disabled, false)
  assert.equal(createSubmit.disabled, false)
  assert.ok(listCalls.length >= 1)
})

test('renderer explains the campaign reset when survivor files are incompatible', async t => {
  const harness = setupRendererHarness({
    customizeApi(api) {
      api.listPeopleSummaries = async () => ({
        records: [],
        unreadableCount: 2,
        totalFiles: 2
      })
    }
  })
  t.after(() => harness.cleanup())

  await harness.flush()

  const status = harness.document.getElementById('status')
  assert.match(status.innerText, /Skipped 2 incompatible or invalid survivor files/)
  assert.match(status.innerText, /Version 3\.0\.1 requires new-campaign schema 6/)
  assert.equal(status.classList.contains('is-error'), true)
})

test('renderer shows compact LAN status indicator and routes it to settings', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const indicator = harness.document.getElementById('navLanStatus')
  const mode = harness.document.getElementById('settingsSurvivorDataMode')
  const hostEnabled = harness.document.getElementById('settingsLanHostEnabled')
  const dataSourcesView = harness.document.getElementById('dataSourcesView')
  const settlementView = harness.document.getElementById('settlementView')

  assert.equal(indicator.textContent, 'Connected')
  assert.equal(indicator.dataset.lanState, 'connected')

  mode.value = 'lan-host'
  hostEnabled.checked = true
  mode.dispatchEvent(new FakeEvent('change', { target: mode }))
  await harness.flush()

  assert.equal(indicator.textContent, 'Hosting')
  assert.equal(indicator.dataset.lanState, 'hosting')

  harness.click('navSettlement')
  await harness.flush()
  assert.ok(!settlementView.classList.contains('hidden'))

  harness.click('navLanStatus')
  await harness.flush()
  assert.ok(!dataSourcesView.classList.contains('hidden'))
})

test('renderer disables survivor writes when LAN client is offline', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, { calls }) {
      api.getLanConnectionStatus = async () => {
        calls.push({ name: 'getLanConnectionStatus', args: [] })
        return { mode: 'lan-client', state: 'offline', label: 'Offline', message: 'LAN host is unavailable' }
      }
    }
  })
  t.after(() => harness.cleanup())

  await harness.flush()

  assert.equal(harness.document.getElementById('navLanStatus').dataset.lanState, 'offline')
  assert.equal(harness.document.getElementById('savePerson').disabled, true)
  assert.equal(harness.document.getElementById('newPersonTemplate').disabled, true)
  assert.equal(harness.document.getElementById('createSurvivorSubmit').disabled, true)
  assert.equal(harness.document.getElementById('settlementApplyBulk').disabled, true)
})

test('renderer finishes initialization with recovery guidance when LAN survivor reads are offline', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, { calls }) {
      api.getLanConnectionStatus = async () => {
        calls.push({ name: 'getLanConnectionStatus', args: [] })
        return { mode: 'lan-client', state: 'offline', label: 'Offline', message: 'LAN host is unavailable' }
      }
      api.listPeople = async () => {
        calls.push({ name: 'listPeople', args: [] })
        const error = new Error('Cannot reach LAN host at http://192.168.1.44:4567')
        error.errorType = 'host-unavailable'
        throw error
      }
    }
  })
  t.after(() => harness.cleanup())

  await harness.flush(16)

  assert.equal(harness.document.getElementById('navLanStatus').dataset.lanState, 'offline')
  assert.equal(harness.document.getElementById('peopleCount').textContent, '0 people loaded')
  assert.ok(countCalls(harness.calls, 'loadDefaultCreateTemplate') >= 1)
  assert.match(
    harness.document.getElementById('status').innerText,
    /Cannot reach the LAN host while loading survivor data.*app is ready.*Open Settings to reconnect/i
  )
})

test('failed LAN settlement refresh preserves the current list and gives recovery guidance', async t => {
  let failRefresh = false
  const harness = setupRendererHarness({
    customizeApi(api, { calls }) {
      const listPeopleSummaries = api.listPeopleSummaries.bind(api)
      api.listPeopleSummaries = async () => {
        if (!failRefresh) return listPeopleSummaries()
        calls.push({ name: 'listPeopleSummaries', args: [] })
        const error = new Error('Cannot reach LAN host at http://192.168.1.44:4567')
        error.errorType = 'host-unavailable'
        throw error
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const settlementCount = harness.document.getElementById('settlementCount')
  assert.equal(settlementCount.textContent, '2 of 2 survivors shown')

  failRefresh = true
  harness.click('settlementRefreshNow')
  await harness.flush(12)

  assert.equal(settlementCount.textContent, '2 of 2 survivors shown')
  assert.match(
    harness.document.getElementById('status').innerText,
    /Cannot reach the LAN host while refreshing Settlement.*current settlement list was kept unchanged.*Open Settings to reconnect/i
  )
})

test('failed LAN showdown reads keep the current view and give recovery guidance', async t => {
  let failLoads = false
  const harness = setupRendererHarness({
    customizeApi(api, { calls }) {
      const loadPerson = api.loadPerson.bind(api)
      api.loadPerson = async fileName => {
        if (!failLoads) return loadPerson(fileName)
        calls.push({ name: 'loadPerson', args: [fileName] })
        const error = new Error('Cannot reach LAN host at http://192.168.1.44:4567')
        error.errorType = 'host-unavailable'
        throw error
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush(12)

  failLoads = true
  harness.click('openShowdown')
  await harness.flush(12)

  assert.ok(!harness.document.getElementById('settlementView').classList.contains('hidden'))
  assert.ok(harness.document.getElementById('showdownView').classList.contains('hidden'))
  assert.match(
    harness.document.getElementById('status').innerText,
    /Cannot reach the LAN host while opening Showdown.*current view was kept unchanged.*Open Settings to reconnect/i
  )
})

test('settings LAN action buttons start stop connect and disconnect', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const mode = harness.document.getElementById('settingsSurvivorDataMode')
  const hostEnabled = harness.document.getElementById('settingsLanHostEnabled')
  const indicator = harness.document.getElementById('navLanStatus')
  const saveBefore = countCalls(harness.calls, 'saveAppSettings')

  mode.value = 'lan-host'
  hostEnabled.checked = false
  mode.dispatchEvent(new FakeEvent('change', { target: mode }))
  await harness.flush()

  harness.click('settingsLanHostStart')
  await harness.flush()
  assert.equal(indicator.textContent, 'Hosting')

  harness.click('settingsLanHostStop')
  await harness.flush()
  assert.equal(indicator.textContent, 'Offline')

  mode.value = 'lan-client'
  mode.dispatchEvent(new FakeEvent('change', { target: mode }))
  await harness.flush()

  harness.click('settingsLanClientDisconnect')
  await harness.flush()
  assert.equal(indicator.dataset.lanState, 'offline')
  assert.equal(harness.document.getElementById('refreshPeople').disabled, true)

  harness.click('settingsLanClientConnect')
  await harness.flush()
  assert.equal(indicator.dataset.lanState, 'connected')
  assert.equal(harness.document.getElementById('refreshPeople').disabled, false)

  const saves = harness.calls.slice(saveBefore).filter(entry => entry.name === 'saveAppSettings')
  assert.ok(saves.some(entry => entry.args[0].lanHostEnabled === true))
  assert.ok(saves.some(entry => entry.args[0].lanHostEnabled === false))
  assert.ok(saves.some(entry => entry.args[0].lanClientConnected === false))
  assert.ok(saves.some(entry => entry.args[0].lanClientConnected === true))
})

test('settings shows LAN host URL and exports survivor backups', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const mode = harness.document.getElementById('settingsSurvivorDataMode')
  mode.value = 'lan-host'
  mode.dispatchEvent(new FakeEvent('change', { target: mode }))
  await harness.flush()

  assert.match(harness.document.getElementById('settingsLanHostAddresses').textContent, /http:\/\/192\.168\.1\.44:4567/)
  assert.equal(harness.document.getElementById('settingsExportBackup').disabled, false)

  harness.click('settingsExportBackup')
  await harness.flush()

  assert.equal(countCalls(harness.calls, 'exportSurvivorDataBackup'), 1)
  assert.match(harness.document.getElementById('status').innerText, /Backup exported to/)
})

test('settings can select a discovered LAN host', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()

  const mode = harness.document.getElementById('settingsSurvivorDataMode')
  const discoveredHosts = harness.document.getElementById('settingsLanDiscoveredHosts')
  const hostAddress = harness.document.getElementById('settingsLanHostAddress')
  const port = harness.document.getElementById('settingsLanPort')
  mode.value = 'lan-client'
  mode.dispatchEvent(new FakeEvent('change', { target: mode }))
  await harness.flush()

  assert.match(discoveredHosts.children[0].textContent, /Table Host/)

  harness.click('settingsLanUseDiscoveredHost')
  await harness.flush()

  assert.equal(hostAddress.value, '192.168.1.50')
  assert.equal(port.value, '4567')
  assert.ok(harness.calls.some(call => call.name === 'saveAppSettings' && call.args[0].lanHostAddress === '192.168.1.50'))
  assert.match(harness.document.getElementById('status').innerText, /Selected Table Host/)
})

test('settings reverts host enabled checkbox when LAN host start fails', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, { calls }) {
      const originalSave = api.saveAppSettings
      api.saveAppSettings = async settings => {
        calls.push({ name: 'saveAppSettings', args: [deepClone(settings)] })
        if (settings?.survivorDataMode === 'lan-host' && settings?.lanHostEnabled) {
          throw new Error('Port already in use')
        }
        return originalSave(settings)
      }
    }
  })
  t.after(() => harness.cleanup())

  await harness.flush()

  const mode = harness.document.getElementById('settingsSurvivorDataMode')
  const hostEnabled = harness.document.getElementById('settingsLanHostEnabled')
  mode.value = 'lan-host'
  mode.dispatchEvent(new FakeEvent('change', { target: mode }))
  await harness.flush()

  hostEnabled.checked = true
  hostEnabled.dispatchEvent(new FakeEvent('change', { target: hostEnabled }))
  await harness.flush()

  assert.equal(hostEnabled.checked, false)
  assert.match(harness.document.getElementById('status').innerText, /Port already in use/)
})

test('renderer refreshes LAN status after survivor save operations', async t => {
  let statusCalls = 0
  const harness = setupRendererHarness({
    customizeApi(api, { calls }) {
      api.getLanConnectionStatus = async () => {
        statusCalls += 1
        calls.push({ name: 'getLanConnectionStatus', args: [] })
        return statusCalls <= 1
          ? { mode: 'lan-client', state: 'connected', label: 'Connected', message: 'Connected to LAN host' }
          : { mode: 'lan-client', state: 'offline', label: 'Offline', message: 'LAN host is unavailable' }
      }
    }
  })
  t.after(() => harness.cleanup())

  await harness.flush()

  const before = countCalls(harness.calls, 'getLanConnectionStatus')
  harness.click('savePerson')
  await harness.flush()

  assert.equal(countCalls(harness.calls, 'savePerson'), 0)
  assert.ok(countCalls(harness.calls, 'getLanConnectionStatus') > before)
  assert.equal(harness.document.getElementById('savePerson').disabled, true)
})

test('renderer surfaces LAN delete failure payloads without refreshing settlement', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, { calls }) {
      api.deletePerson = async fileName => {
        calls.push({ name: 'deletePerson', args: [fileName] })
        return {
          deleted: false,
          ok: false,
          errorType: 'host-unavailable',
          message: 'Cannot reach LAN host at http://192.168.1.44:4567'
        }
      }
    }
  })
  t.after(() => harness.cleanup())

  await harness.flush()
  const peopleList = harness.document.getElementById('peopleList')
  peopleList.value = 'alice.json'
  const refreshBefore = countCalls(harness.calls, 'listPeopleSummaries')

  harness.click('deletePerson')
  await harness.flush()

  assert.equal(countCalls(harness.calls, 'deletePerson'), 1)
  assert.equal(countCalls(harness.calls, 'listPeopleSummaries'), refreshBefore)
  assert.match(harness.document.getElementById('status').innerText, /Cannot reach LAN host/)
  assert.ok(harness.db['alice.json'])
})

test('renderer refreshes settlement when LAN host pushes survivor data changes', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())

  await harness.flush()
  assert.equal(harness.document.getElementById('settlementCount').textContent, '2 of 2 survivors shown')

  const before = countCalls(harness.calls, 'listPeopleSummaries')
  harness.db['cara.json'] = makePerson('Cara')
  harness.emitLanSurvivorDataChanged({ action: 'save', fileName: 'cara.json' })
  await new Promise(resolve => setTimeout(resolve, 5))
  await harness.flush()

  assert.ok(countCalls(harness.calls, 'listPeopleSummaries') > before)
  assert.equal(harness.document.getElementById('settlementCount').textContent, '3 of 3 survivors shown')
  assert.match(harness.document.getElementById('status').innerText, /Settlement refreshed from LAN host change/)
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
  const renamed = findDbPersonByName(harness.db, 'Alicia')
  assert.equal(renamed?.name, 'Alicia')
  assert.equal(peopleList.value, personFileName(renamed))
  assert.ok(!harness.calls.some(call => call.name === 'deletePerson' && call.args[0] === 'alice.json'))
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

test('showdown temp combat modifiers can go negative while tokens clamp at zero', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const showdownView = harness.document.getElementById('showdownView')
  const showdownCardA = harness.document.getElementById('showdownCardA')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()

  const tempButton = harness.document.createElement('button')
  tempButton.dataset.showdownSlot = 'A'
  tempButton.dataset.showdownField = 'strength'
  tempButton.dataset.showdownKind = 'temporary'
  tempButton.dataset.showdownDelta = '-1'
  showdownView.dispatchEvent(new FakeEvent('click', { target: tempButton }))
  await harness.flush()

  assert.match(showdownCardA.innerHTML, /showdown-stat-total-value">-1</)
  assert.match(showdownCardA.innerHTML, /showdown-bucket-label">Temp<\/span>[\s\S]*showdown-static-value">-1</)

  const tokenButton = harness.document.createElement('button')
  tokenButton.dataset.showdownSlot = 'A'
  tokenButton.dataset.showdownField = 'strength'
  tokenButton.dataset.showdownKind = 'tokensPositive'
  tokenButton.dataset.showdownDelta = '-1'
  showdownView.dispatchEvent(new FakeEvent('click', { target: tokenButton }))
  await harness.flush()

  assert.match(showdownCardA.innerHTML, /showdown-bucket-label">Tokens \(\+\)<\/span>[\s\S]*showdown-static-value">0</)
})

test('refresh showdown survivors replaces persisted data only before departure', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const showdownView = harness.document.getElementById('showdownView')
  const showdownCardA = harness.document.getElementById('showdownCardA')
  const status = harness.document.getElementById('status')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()

  const lumiButton = harness.document.createElement('button')
  lumiButton.dataset.showdownSlot = 'A'
  lumiButton.dataset.showdownField = 'lumi'
  lumiButton.dataset.showdownKind = 'base'
  lumiButton.dataset.showdownDelta = '1'
  lumiButton.dataset.showdownMin = '0'
  lumiButton.dataset.showdownMax = ''
  showdownView.dispatchEvent(new FakeEvent('click', { target: lumiButton }))
  await harness.flush()
  assert.match(showdownCardA.innerHTML, /Lumi[\s\S]*?data-showdown-field="lumi"[\s\S]*?showdown-static-value">1</)

  harness.db['alice.json'].lumi = 7
  harness.click('refreshShowdownSurvivors')
  await harness.flush(12)

  assert.match(status.innerText, /Showdown survivors refreshed from settlement data/)
  assert.match(showdownCardA.innerHTML, /Lumi[\s\S]*?data-showdown-field="lumi"[\s\S]*?showdown-static-value">7</)

  harness.click('departShowdown')
  await harness.flush()
  harness.db['alice.json'].lumi = 9
  harness.click('refreshShowdownSurvivors')
  await harness.flush()

  assert.match(status.innerText, /Cannot refresh while departed/)
  assert.match(showdownCardA.innerHTML, /Lumi[\s\S]*?data-showdown-field="lumi"[\s\S]*?showdown-static-value">7</)
})

test('successful showdown end saves both survivors, clears selections, and resets temporary state', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const showdownView = harness.document.getElementById('showdownView')
  const showdownCardA = harness.document.getElementById('showdownCardA')
  const sessionState = harness.document.getElementById('showdownSessionState')
  const settlementView = harness.document.getElementById('settlementView')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()

  const tempButton = harness.document.createElement('button')
  tempButton.dataset.showdownSlot = 'A'
  tempButton.dataset.showdownField = 'strength'
  tempButton.dataset.showdownKind = 'temporary'
  tempButton.dataset.showdownDelta = '2'
  showdownView.dispatchEvent(new FakeEvent('click', { target: tempButton }))

  const tokenButton = harness.document.createElement('button')
  tokenButton.dataset.showdownSlot = 'A'
  tokenButton.dataset.showdownField = 'strength'
  tokenButton.dataset.showdownKind = 'tokensPositive'
  tokenButton.dataset.showdownDelta = '1'
  showdownView.dispatchEvent(new FakeEvent('click', { target: tokenButton }))

  const armorButton = harness.document.createElement('button')
  armorButton.dataset.showdownSlot = 'A'
  armorButton.dataset.showdownBulkArmorDelta = '1'
  showdownView.dispatchEvent(new FakeEvent('click', { target: armorButton }))

  const bleedingButton = harness.document.createElement('button')
  bleedingButton.dataset.showdownSlot = 'A'
  bleedingButton.dataset.showdownPart = 'bleedingTokens'
  bleedingButton.dataset.showdownDelta = '1'
  showdownView.dispatchEvent(new FakeEvent('click', { target: bleedingButton }))

  for (const key of ['proficiencyReminder', 'bodyHeavy']) {
    const checkbox = harness.document.createElement('input')
    checkbox.dataset.showdownSlot = 'A'
    checkbox.dataset.showdownArmorCheck = key
    checkbox.checked = true
    showdownView.dispatchEvent(new FakeEvent('change', { target: checkbox }))
  }
  await harness.flush()

  const saveBaseline = harness.calls.length
  harness.click('departShowdown')
  await harness.flush()
  harness.click('showdownOver')
  await harness.flush(16)

  const showdownSaves = harness.calls
    .slice(saveBaseline)
    .filter(entry => entry.name === 'savePerson' && entry.args[1]?.markReturned === true)
  assert.equal(showdownSaves.length, 2)
  assert.deepEqual(
    showdownSaves.map(entry => entry.args[1].expectedFileName).sort(),
    ['alice.json', 'bob.json']
  )
  assert.equal(showdownSelectA.value, '')
  assert.equal(showdownSelectB.value, '')
  assert.equal(sessionState.textContent, 'Session not departed')
  assert.ok(!settlementView.classList.contains('hidden'))

  showdownSelectA.value = personFileName(findDbPersonByName(harness.db, 'Alice'))
  showdownSelectB.value = personFileName(findDbPersonByName(harness.db, 'Bob'))
  harness.click('openShowdown')
  await harness.flush(12)

  assert.equal((showdownCardA.innerHTML.match(/showdown-armor-value">0</g) || []).length, 5)
  assert.match(showdownCardA.innerHTML, /Bleeding Tokens[\s\S]*?showdown-static-value">0</)
  assert.match(showdownCardA.innerHTML, /showdown-bucket-label">Temp<\/span>[\s\S]*?showdown-static-value">0</)
  assert.match(showdownCardA.innerHTML, /showdown-bucket-label">Tokens \(\+\)<\/span>[\s\S]*?showdown-static-value">0</)

  const reminderTag = showdownCardA.innerHTML.match(
    /<input\b[^>]*data-showdown-armor-check="proficiencyReminder"[^>]*>/
  )?.[0]
  const bodyHeavyTag = showdownCardA.innerHTML.match(
    /<input\b[^>]*data-showdown-armor-check="bodyHeavy"[^>]*>/
  )?.[0]
  assert.ok(reminderTag)
  assert.ok(bodyHeavyTag)
  assert.doesNotMatch(reminderTag, /\bchecked\b/)
  assert.doesNotMatch(bodyHeavyTag, /\bchecked\b/)
})

test('showdown inline abilities, impairments, and notes edits persist on successful end', async t => {
  const harness = setupRendererHarness({
    customizeApi(_api, context) {
      context.db['alice.json'] = makePerson('Alice', {
        abilities: ['Dash'],
        impairments: ['Broken Arm'],
        notes: ['Carry lantern']
      })
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const showdownView = harness.document.getElementById('showdownView')
  const showdownCardA = harness.document.getElementById('showdownCardA')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()

  const replacements = {
    abilities: 'Survivor Dash',
    impairments: 'Mended Arm',
    notes: 'Carry two lanterns'
  }
  for (const [arrayName, replacement] of Object.entries(replacements)) {
    const editButton = harness.document.createElement('button')
    editButton.dataset.showdownEditSlot = 'A'
    editButton.dataset.showdownEditArray = arrayName
    editButton.dataset.showdownEditIndex = '0'
    showdownView.dispatchEvent(new FakeEvent('click', { target: editButton }))

    const textarea = harness.document.createElement('textarea')
    textarea.dataset.showdownDraftSlot = 'A'
    textarea.dataset.showdownDraftArray = arrayName
    textarea.dataset.showdownDraftIndex = '0'
    textarea.value = replacement
    showdownView.dispatchEvent(new FakeEvent('input', { target: textarea }))

    const commitButton = harness.document.createElement('button')
    commitButton.dataset.showdownCommitSlot = 'A'
    commitButton.dataset.showdownCommitArray = arrayName
    commitButton.dataset.showdownCommitIndex = '0'
    showdownView.dispatchEvent(new FakeEvent('click', { target: commitButton }))
    await harness.flush()

    assert.match(showdownCardA.innerHTML, new RegExp(replacement))
  }

  harness.click('departShowdown')
  await harness.flush()
  harness.click('showdownOver')
  await harness.flush(16)

  const alice = findDbPersonByName(harness.db, 'Alice')
  assert.deepEqual(alice?.abilities, [replacements.abilities])
  assert.deepEqual(alice?.impairments, [replacements.impairments])
  assert.deepEqual(alice?.notes, [replacements.notes])
})

test('showdown page and accordion state survive slot rerenders', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush()

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const showdownView = harness.document.getElementById('showdownView')
  const showdownCardA = harness.document.getElementById('showdownCardA')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush()

  const traitsPageButton = harness.document.createElement('button')
  traitsPageButton.dataset.showdownPageSlot = 'A'
  traitsPageButton.dataset.showdownPage = 'traits'
  showdownView.dispatchEvent(new FakeEvent('click', { target: traitsPageButton }))
  await harness.flush()

  const abilitiesDetails = showdownCardA.querySelector('details[data-showdown-section="abilities"]')
  assert.ok(abilitiesDetails)
  abilitiesDetails.open = false

  const rerenderButton = harness.document.createElement('button')
  rerenderButton.dataset.showdownSlot = 'A'
  rerenderButton.dataset.showdownField = 'strength'
  rerenderButton.dataset.showdownKind = 'temporary'
  rerenderButton.dataset.showdownDelta = '1'
  showdownView.dispatchEvent(new FakeEvent('click', { target: rerenderButton }))
  await harness.flush()

  assert.match(showdownCardA.innerHTML, /data-showdown-page="traits"[^>]*aria-pressed="true"/)
  assert.equal(showdownCardA.querySelector('details[data-showdown-section="abilities"]')?.open, false)
})

test('knowledge picker puts shared settlement unlocks first and applies definitions without source templates', async t => {
  const harness = setupRendererHarness({
    customizeApi(api) {
      api.getSettlementRecord = async () => ({ knowledges: [
        { id: 'unlocked', definition: { name: 'Zebra', rules: 'Stored rules', knowledgeLevel: 1 } },
        { id: 'missing-template', definition: { name: 'Lost Template', rules: 'Available without source', knowledgeLevel: 2 } }
      ] })
      api.listKnowledgeTemplates = async type => type === 'knowledge' ? [
        { fileName: 'alpha.json', name: 'Alpha', template: { name: 'Alpha', knowledgeLevel: 1 } },
        { fileName: 'zebra.json', name: 'Zebra', template: { name: 'Zebra', knowledgeLevel: 1 } }
      ] : [{ fileName: 'tenet.json', name: 'Tenet Source', template: { name: 'Tenet Source', knowledgeLevel: 1 } }]
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush()
  harness.click('navCreate')
  await harness.flush(12)
  harness.click('createAddKnowledge')
  await harness.flush(12)
  const select = harness.document.getElementById('knowledgeTemplateSelect')
  assert.deepEqual(select.children.map(option => option.textContent), ['Lost Template (L2)', 'Zebra (L1)', '-----', 'Alpha (L1)', 'Tenet Source (L1)'])
  assert.equal(select.children[2].disabled, true)
  const search = harness.document.getElementById('knowledgeTemplateSearch')
  search.value = 'Alpha'
  harness.dispatch(search, 'input')
  assert.deepEqual(select.children.map(option => option.textContent), ['Alpha (L1)'])
  search.value = ''
  harness.dispatch(search, 'input')
  select.value = 'settlement:missing-template'
  harness.click('knowledgeTemplateUse')
  await harness.flush(12)
  const row = harness.document.getElementById('createKnowledge').querySelector('.ve-row')
  assert.equal(row.querySelector('[data-field="name"]').value, 'Lost Template')
  assert.equal(row.querySelector('[data-field="currentObservations"]').value, '0')
  harness.click('createAddTenetKnowledge')
  await harness.flush(12)
  assert.deepEqual(select.children.slice(0, 3).map(option => option.textContent), ['Lost Template (L2)', 'Zebra (L1)', '-----'])
})

test('knowledge picker reports settlement read failure and retains available local templates', async t => {
  const harness = setupRendererHarness({ customizeApi(api) {
    api.getSettlementRecord = async () => { throw new Error('Host unavailable') }
    api.listKnowledgeTemplates = async () => [{ fileName: 'local.json', name: 'Local', template: { name: 'Local', knowledgeLevel: 1 } }]
  } })
  t.after(() => harness.cleanup())
  await harness.flush()
  harness.click('navCreate')
  await harness.flush(12)
  harness.click('createAddKnowledge')
  await harness.flush(12)
  assert.match(harness.document.getElementById('status').innerText, /Settlement knowledge unavailable: Host unavailable/)
  const select = harness.document.getElementById('knowledgeTemplateSelect')
  assert.deepEqual(select.children.map(option => option.textContent), ['Local (L1)'])
})

test('survivor save warns about pending settlement registration without treating the save as failed', async t => {
  const harness = setupRendererHarness({ customizeApi(api) {
    const save = api.savePerson
    api.savePerson = async (...args) => ({ ...await save(...args), settlementWarning: 'Survivor saved; registration pending' })
  } })
  t.after(() => harness.cleanup())
  await harness.flush()
  harness.click('navCreate')
  await harness.flush(12)
  harness.document.getElementById('createSurvivorName').value = 'New Survivor'
  harness.click('createSurvivorSubmit')
  await harness.flush(20)
  assert.ok(harness.alerts.some(message => message.includes('registration pending')))
  assert.ok(findDbPersonByName(harness.db, 'New Survivor'))
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

  const alice = findDbPersonByName(harness.db, 'Alice')
  assert.equal(alice?.knowledge?.[0]?.name, 'Inner Lantern II')
  assert.equal(alice?.knowledge?.[0]?.knowledgeLevel, 2)
  assert.equal(alice?.knowledge?.[0]?.currentObservations, 0)
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

test('bulk updates can apply lumi to living survivors', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      context.db['alice.json'] = makePerson('Alice', {
        isAlive: true,
        lumi: 1
      })
      context.db['bob.json'] = makePerson('Bob', {
        isAlive: false,
        lumi: 7
      })
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const rows = harness.document.getElementById('settlementBulkRows')
  rows.innerHTML = ''
  const row = harness.document.createElement('div')
  row.className = 'settlement-bulk-row'
  const field = harness.document.createElement('select')
  field.dataset.bulkField = ''
  field.value = 'lumi'
  const delta = harness.document.createElement('input')
  delta.dataset.bulkDelta = ''
  delta.value = '2'
  row.append(field, delta)
  rows.appendChild(row)

  harness.click('settlementApplyBulk')
  await harness.flush(16)

  assert.equal(findDbPersonByName(harness.db, 'Alice').lumi, 3)
  assert.equal(harness.db['bob.json'].lumi, 7)
  assert.match(harness.confirms[0], /Apply \+2 Lumi to all 1 living survivors/)
})

test('bulk updates continue after individual save failures and report the final outcome', async t => {
  const harness = setupRendererHarness({
    customizeApi(api, context) {
      context.db['cara.json'] = makePerson('Cara', { lumi: 4 })
      const savePerson = api.savePerson.bind(api)
      api.savePerson = async (person, options) => {
        if (person.name === 'Bob') {
          context.calls.push({ name: 'savePerson', args: [deepClone(person), deepClone(options)] })
          return { ok: false, message: 'Stale survivor revision' }
        }
        if (person.name === 'Cara') {
          context.calls.push({ name: 'savePerson', args: [deepClone(person), deepClone(options)] })
          throw new Error('Host unavailable')
        }
        return savePerson(person, options)
      }
    }
  })
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const rows = harness.document.getElementById('settlementBulkRows')
  rows.innerHTML = ''
  const row = harness.document.createElement('div')
  row.className = 'settlement-bulk-row'
  const field = harness.document.createElement('select')
  field.dataset.bulkField = ''
  field.value = 'lumi'
  const delta = harness.document.createElement('input')
  delta.dataset.bulkDelta = ''
  delta.value = '2'
  row.append(field, delta)
  rows.appendChild(row)

  harness.click('settlementApplyBulk')
  await harness.flush(20)

  assert.equal(findDbPersonByName(harness.db, 'Alice').lumi, 2)
  assert.equal(findDbPersonByName(harness.db, 'Bob').lumi, 0)
  assert.equal(findDbPersonByName(harness.db, 'Cara').lumi, 4)
  assert.equal(
    harness.calls.filter(call => call.name === 'savePerson').length,
    3
  )
  assert.match(
    harness.document.getElementById('status').innerText,
    /Bulk update complete: 1 updated, 0 unchanged, 2 failed \(\+2 Lumi\)/
  )
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

test('departed showdown survives transitions through Create and Settlement without reloading survivors', async t => {
  const harness = setupRendererHarness()
  t.after(() => harness.cleanup())
  await harness.flush(12)

  const showdownSelectA = harness.document.getElementById('showdownSelectA')
  const showdownSelectB = harness.document.getElementById('showdownSelectB')
  const createView = harness.document.getElementById('createSurvivorView')
  const settlementView = harness.document.getElementById('settlementView')
  const showdownView = harness.document.getElementById('showdownView')
  const sessionState = harness.document.getElementById('showdownSessionState')
  const status = harness.document.getElementById('status')

  showdownSelectA.value = 'alice.json'
  showdownSelectB.value = 'bob.json'
  harness.click('openShowdown')
  await harness.flush(12)
  harness.click('departShowdown')
  await harness.flush()

  const loadAfterDepart = countCalls(harness.calls, 'loadPerson')
  assert.equal(sessionState.textContent, 'Session departed')

  harness.click('navCreate')
  await harness.flush(12)

  assert.ok(!createView.classList.contains('hidden'))
  assert.ok(showdownView.classList.contains('hidden'))
  assert.equal(countCalls(harness.calls, 'loadPerson'), loadAfterDepart)

  harness.click('navSettlement')
  await harness.flush()

  assert.ok(!settlementView.classList.contains('hidden'))
  assert.ok(createView.classList.contains('hidden'))

  harness.click('navShowdown')
  await harness.flush()

  assert.ok(!showdownView.classList.contains('hidden'))
  assert.equal(countCalls(harness.calls, 'loadPerson'), loadAfterDepart)
  assert.equal(showdownSelectA.value, 'alice.json')
  assert.equal(showdownSelectB.value, 'bob.json')
  assert.equal(showdownSelectA.disabled, true)
  assert.equal(showdownSelectB.disabled, true)
  assert.equal(sessionState.textContent, 'Session departed')
  assert.match(status.innerText, /Resumed departed showdown session/)
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
        const nextFileName = personFileName(person)
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
  assert.equal(findDbPersonByName(harness.db, 'Alice').revision, 3)
  assert.equal(findDbPersonByName(harness.db, 'Bob').revision, 2)
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
        const nextFileName = personFileName(person)
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
  assert.match(status.innerText, /Bob failed with a stale revision conflict: Stale survivor revision/)
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
