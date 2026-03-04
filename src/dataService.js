const fs = require('fs')
const path = require('path')
const Ajv2020 = require('ajv/dist/2020')

const KNOWLEDGE_TEMPLATE_TYPE_FOLDERS = {
  tenetKnowledge: 'tenet-knowledge',
  knowledge: 'knowledge'
}
const SOURCE_KEYS = [
  'survivors',
  'defaultSurvivorTemplates',
  'fightingArts',
  'secretFightingArts',
  'knowledges',
  'tenetKnowledges',
  'neuroses',
  'disorders'
]
const DEFAULT_CREATE_TEMPLATE_FILE_NAME = 'default-new-survivor.json'
const MARKDOWN_SOURCE_LABELS = {
  fightingArts: 'Fighting Arts',
  secretFightingArts: 'Secret Fighting Arts',
  knowledges: 'Knowledges',
  tenetKnowledges: 'Tenet Knowledges',
  disorders: 'Disorders'
}
const MARKDOWN_PREVIEW_CACHE_MAX = 3000
const markdownPreviewCache = new Map()

const schemaPath = path.join(__dirname, 'validation', 'person.schema.json')
const personSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: false })
const validatePerson = ajv.compile(personSchema)
const CURRENT_PERSON_SCHEMA_VERSION = 1

class ValidationError extends Error {
  constructor(message, errors) {
    super(message)
    this.name = 'ValidationError'
    this.validationErrors = errors
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConflictError'
  }
}

function coerceSchemaVersion(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return 0
  return Math.trunc(parsed)
}

function applyPersonSchemaCompatibility(person) {
  if (!person || typeof person !== 'object') return person
  const next = { ...person }
  const schemaVersion = coerceSchemaVersion(next.schemaVersion)

  if (schemaVersion === 0) {
    next.schemaVersion = CURRENT_PERSON_SCHEMA_VERSION
    return next
  }

  if (schemaVersion > CURRENT_PERSON_SCHEMA_VERSION) {
    throw new ValidationError(
      'Unsupported person schemaVersion ' + schemaVersion + '. This app supports up to ' + CURRENT_PERSON_SCHEMA_VERSION + '.',
      [
        {
          path: '/schemaVersion',
          keyword: 'schemaVersion',
          message: 'Unsupported schemaVersion ' + schemaVersion + '; supported max is ' + CURRENT_PERSON_SCHEMA_VERSION
        }
      ]
    )
  }

  if (schemaVersion < CURRENT_PERSON_SCHEMA_VERSION) {
    // Migration stub for future schema upgrades.
    next.schemaVersion = CURRENT_PERSON_SCHEMA_VERSION
    return next
  }

  next.schemaVersion = schemaVersion
  return next
}

function getConfigPath(app) {
  return path.join(app.getPath('userData'), 'config.json')
}

function normalizeDataSources(input) {
  const next = {}
  for (const key of SOURCE_KEYS) {
    const value = input && typeof input[key] === 'string' ? input[key].trim() : ''
    next[key] = value
  }
  return next
}

function ensureFolderStructure() {}

function saveConfig(app, dataSources) {
  const configPath = getConfigPath(app)
  fs.mkdirSync(path.dirname(configPath), { recursive: true })
  const normalized =
    typeof dataSources === 'string' ? normalizeDataSources({ survivors: dataSources }) : normalizeDataSources(dataSources || {})
  fs.writeFileSync(configPath, JSON.stringify({ dataSources: normalized }, null, 2), 'utf8')
}

function setDataSource(app, sourceKey, folderPath) {
  if (!SOURCE_KEYS.includes(sourceKey)) throw new Error('Invalid data source key')
  if (typeof folderPath !== 'string' || folderPath.trim().length === 0) {
    throw new Error('Invalid folder path')
  }
  const current = getSavedDataSources(app)
  current[sourceKey] = folderPath.trim()
  saveConfig(app, current)
  return current
}

function getSavedDataSources(app) {
  const configPath = getConfigPath(app)
  if (!fs.existsSync(configPath)) return normalizeDataSources({})

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    if (config && typeof config === 'object') {
      if (config.dataSources && typeof config.dataSources === 'object') {
        return normalizeDataSources(config.dataSources)
      }
      // Backward compatibility for legacy single-path config.
      if (typeof config.dataPath === 'string' && config.dataPath.trim().length > 0) {
        return normalizeDataSources({ survivors: config.dataPath.trim() })
      }
    }
  } catch {
    return normalizeDataSources({})
  }
  return normalizeDataSources({})
}

function getSavedDataFolder(app) {
  const sources = getSavedDataSources(app)
  return sources.survivors || null
}

function ensureDataFolderConfigured(app) {
  const dataPath = getSavedDataFolder(app)
  if (!dataPath) throw new Error('No data folder selected')
  return dataPath
}

function personPath(basePath, personName) {
  const safeName = slugify(personName)
  if (!safeName) throw new Error('Person name must include letters or numbers')
  return path.join(basePath, `${safeName}.json`)
}

function slugify(value) {
  if (typeof value !== 'string') return ''
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapValidationErrors(errors = []) {
  return errors.map(err => ({
    path: err.instancePath || '/',
    keyword: err.keyword,
    message: err.message || 'Invalid value'
  }))
}

function validationErrorSummary(errors) {
  return errors.map(err => `${err.path} ${err.message}`).join('; ')
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function atomicWriteJson(filePath, data) {
  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8')
    fs.renameSync(tmpPath, filePath)
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
  }
}

function resolveIncomingRevision(person) {
  const revision = Number(person?.revision)
  if (!Number.isFinite(revision) || revision < 0) return 0
  return Math.floor(revision)
}

function savePerson(basePath, person, options = {}) {
  fs.mkdirSync(basePath, { recursive: true })
  const normalizedPerson = applyPersonSchemaCompatibility(person)
  if (!validatePerson(normalizedPerson)) {
    const errors = mapValidationErrors(validatePerson.errors || [])
    throw new ValidationError(`Invalid person data: ${validationErrorSummary(errors)}`, errors)
  }

  const targetPath = personPath(basePath, normalizedPerson.name)
  const incomingRevision = resolveIncomingRevision(normalizedPerson)
  const expectedFileName =
    typeof options.expectedFileName === 'string' && options.expectedFileName.endsWith('.json')
      ? path.basename(options.expectedFileName)
      : null
  const expectedPath = expectedFileName ? path.join(basePath, expectedFileName) : null

  let baselineRevision = null

  if (expectedPath && expectedPath !== targetPath) {
    const expectedExisting = readJsonIfExists(expectedPath)
    if (!expectedExisting) {
      throw new ConflictError('Original survivor file no longer exists. Refresh before saving.')
    }
    const expectedRevision = resolveIncomingRevision(expectedExisting)
    if (incomingRevision !== expectedRevision) {
      throw new ConflictError('Survivor was modified by another session. Refresh before saving.')
    }
    baselineRevision = expectedRevision
  }

  const targetExisting = readJsonIfExists(targetPath)
  if (targetExisting) {
    const targetRevision = resolveIncomingRevision(targetExisting)
    if (incomingRevision !== targetRevision) {
      throw new ConflictError('Survivor was modified by another session. Refresh before saving.')
    }
    baselineRevision = targetRevision
  }

  const nextRevision = (baselineRevision ?? incomingRevision) + 1
  const personToSave = {
    ...normalizedPerson,
    revision: nextRevision,
    updatedAt: new Date().toISOString()
  }

  if (!validatePerson(personToSave)) {
    const errors = mapValidationErrors(validatePerson.errors || [])
    throw new ValidationError(`Invalid person data: ${validationErrorSummary(errors)}`, errors)
  }

  atomicWriteJson(targetPath, personToSave)
  return path.basename(targetPath)
}

function loadPerson(basePath, fileName) {
  if (typeof fileName !== 'string' || !fileName.endsWith('.json')) {
    throw new Error('Invalid person filename')
  }

  const fullPath = path.join(basePath, path.basename(fileName))
  if (!fs.existsSync(fullPath)) throw new Error('Person file not found')

  const personRaw = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  const person = applyPersonSchemaCompatibility(personRaw)
  if (!validatePerson(person)) {
    const errors = mapValidationErrors(validatePerson.errors || [])
    throw new ValidationError(`Stored person data is invalid: ${validationErrorSummary(errors)}`, errors)
  }

  return person
}

function listPeople(basePath) {
  if (!fs.existsSync(basePath) || !fs.statSync(basePath).isDirectory()) return []

  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

function deletePerson(basePath, fileName) {
  if (typeof fileName !== 'string' || !fileName.endsWith('.json')) {
    throw new Error('Invalid person filename')
  }

  const fullPath = path.join(basePath, path.basename(fileName))
  if (!fs.existsSync(fullPath)) throw new Error('Person file not found')

  fs.unlinkSync(fullPath)
}

function createPersonTemplate(name = 'New Survivor') {
  return {
    name,
    schemaVersion: CURRENT_PERSON_SCHEMA_VERSION,
    revision: 0,
    updatedAt: new Date().toISOString(),
    gender: 'M',
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
    knowledge: []
  }
}

function saveDefaultCreateTemplate(basePath, template) {
  if (typeof basePath !== 'string' || basePath.trim().length === 0) {
    throw new Error('Default survivor template folder is not configured')
  }
  const folder = basePath.trim()
  fs.mkdirSync(folder, { recursive: true })
  const normalizedTemplate = applyPersonSchemaCompatibility(template)
  if (!validatePerson(normalizedTemplate)) {
    const errors = mapValidationErrors(validatePerson.errors || [])
    throw new ValidationError(`Invalid person data: ${validationErrorSummary(errors)}`, errors)
  }
  const fullPath = path.join(folder, DEFAULT_CREATE_TEMPLATE_FILE_NAME)
  atomicWriteJson(fullPath, normalizedTemplate)
  return DEFAULT_CREATE_TEMPLATE_FILE_NAME
}

function loadDefaultCreateTemplate(basePath) {
  if (typeof basePath !== 'string' || basePath.trim().length === 0) return null
  const folder = basePath.trim()
  const fullPath = path.join(folder, DEFAULT_CREATE_TEMPLATE_FILE_NAME)
  if (!fs.existsSync(fullPath)) return null
  const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  const normalizedTemplate = applyPersonSchemaCompatibility(raw)
  if (!validatePerson(normalizedTemplate)) {
    const errors = mapValidationErrors(validatePerson.errors || [])
    throw new ValidationError(`Invalid person data: ${validationErrorSummary(errors)}`, errors)
  }
  return normalizedTemplate
}

function listMarkdownCollections(dataSources) {
  const normalized = normalizeDataSources(dataSources || {})
  const categories = Object.keys(MARKDOWN_SOURCE_LABELS)
  const collections = []
  for (const category of categories) {
    const folderPath = normalized[category]
    if (!folderPath) continue
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) continue
    const files = collectMarkdownFiles(folderPath)
    collections.push({
      id: category,
      source: 'configured',
      category,
      folder: folderPath,
      label: MARKDOWN_SOURCE_LABELS[category],
      count: files.length
    })
  }
  return collections.sort((a, b) => a.label.localeCompare(b.label))
}

function parseCollectionId(dataSources, collectionId) {
  const normalized = normalizeDataSources(dataSources || {})
  const category = String(collectionId || '')
  if (!MARKDOWN_SOURCE_LABELS[category]) throw new Error('Invalid markdown collection id')
  const folderPath = normalized[category]
  if (!folderPath) throw new Error('Markdown source is unavailable')
  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    throw new Error('Markdown collection not found')
  }
  return { source: 'configured', category, folder: folderPath, folderPath }
}

function makeMarkdownPreview(content) {
  const compact = content.replace(/\s+/g, ' ').trim()
  if (compact.length <= 160) return compact
  return `${compact.slice(0, 157)}...`
}

function extractObsidianLinkLabel(inner) {
  const raw = String(inner || '')
  const pipeIndex = raw.indexOf('|')
  if (pipeIndex >= 0) {
    const alias = raw.slice(pipeIndex + 1).trim()
    if (alias) return alias
    return raw.slice(0, pipeIndex).trim()
  }
  return raw.trim()
}

function normalizeObsidianMarkdown(content) {
  if (typeof content !== 'string') return ''
  return content
    .replace(/!\[\[([^\]]+)\]\]/g, (_match, inner) => extractObsidianLinkLabel(inner))
    .replace(/\[\[([^\]]+)\]\]/g, (_match, inner) => extractObsidianLinkLabel(inner))
    .replace(/(^|[\s(])#([A-Za-z0-9_/-]+)/g, '$1')
}

function touchMarkdownPreviewCache(cacheKey, record) {
  if (markdownPreviewCache.has(cacheKey)) markdownPreviewCache.delete(cacheKey)
  markdownPreviewCache.set(cacheKey, record)
  while (markdownPreviewCache.size > MARKDOWN_PREVIEW_CACHE_MAX) {
    const oldestKey = markdownPreviewCache.keys().next().value
    if (!oldestKey) break
    markdownPreviewCache.delete(oldestKey)
  }
}

function getMarkdownPreviewMetadata(fullPath, fileName) {
  const stat = fs.statSync(fullPath)
  const cacheKey = path.resolve(fullPath)
  const cached = markdownPreviewCache.get(cacheKey)
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    touchMarkdownPreviewCache(cacheKey, cached)
    return {
      title: cached.title,
      preview: cached.preview
    }
  }

  const rawContent = fs.readFileSync(fullPath, 'utf8')
  const content = normalizeObsidianMarkdown(rawContent)
  const next = {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    title: markdownDisplayName(fileName),
    preview: makeMarkdownPreview(content)
  }
  touchMarkdownPreviewCache(cacheKey, next)
  return {
    title: next.title,
    preview: next.preview
  }
}

function markdownDisplayName(fileName) {
  return fileName
    .replace(/\.md$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function normalizeMarkdownRelativePath(fileName) {
  if (typeof fileName !== 'string') throw new Error('Invalid markdown filename')
  const normalizedSlash = fileName.trim().replace(/\\/g, '/')
  if (!normalizedSlash.toLowerCase().endsWith('.md')) throw new Error('Invalid markdown filename')
  const normalizedPosix = path.posix.normalize(normalizedSlash)
  if (!normalizedPosix || normalizedPosix === '.' || normalizedPosix.startsWith('/') || normalizedPosix === '..') {
    throw new Error('Invalid markdown filename')
  }
  if (normalizedPosix.startsWith('../')) throw new Error('Invalid markdown filename')
  return normalizedPosix
}

function listMarkdownFiles(dataPath, collectionId) {
  const { folderPath } = parseCollectionId(dataPath, collectionId)
  return collectMarkdownFiles(folderPath)
}

function loadMarkdownFile(dataPath, collectionId, fileName) {
  const { folder, folderPath } = parseCollectionId(dataPath, collectionId)
  const normalizedFileName = normalizeMarkdownRelativePath(fileName)
  const fullPath = path.join(folderPath, ...normalizedFileName.split('/'))
  const rootResolved = path.resolve(folderPath)
  const fileResolved = path.resolve(fullPath)
  if (!fileResolved.startsWith(rootResolved)) {
    throw new Error('Invalid markdown filename')
  }
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    throw new Error('Markdown file not found')
  }

  return {
    collectionId,
    folder,
    fileName: normalizedFileName,
    title: markdownDisplayName(path.basename(normalizedFileName)),
    markdown: normalizeObsidianMarkdown(fs.readFileSync(fullPath, 'utf8'))
  }
}

function collectMarkdownFiles(rootPath) {
  const files = []
  function walk(relativeFolder) {
    const currentPath = path.join(rootPath, relativeFolder)
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const child = relativeFolder ? path.join(relativeFolder, entry.name) : entry.name
        walk(child)
        continue
      }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue
      const relativePath = relativeFolder ? path.join(relativeFolder, entry.name) : entry.name
      const fullPath = path.join(rootPath, relativePath)
      const fileKey = relativePath.replace(/\\/g, '/')
      const metadata = getMarkdownPreviewMetadata(fullPath, entry.name)
      files.push({
        fileName: fileKey,
        title: metadata.title,
        preview: metadata.preview
      })
    }
  }
  walk('')
  return files.sort((a, b) => a.title.localeCompare(b.title))
}

function getKnowledgeTemplateFolder(basePath, type) {
  const validType = KNOWLEDGE_TEMPLATE_TYPE_FOLDERS[type]
  if (!validType) throw new Error('Invalid knowledge template type')
  if (typeof basePath !== 'string' || basePath.trim().length === 0) {
    throw new Error('Knowledge template folder is not configured')
  }
  return basePath.trim()
}

function sanitizeKnowledgeTemplate(type, template) {
  if (!template || typeof template !== 'object') throw new Error('Invalid knowledge template payload')

  const name = String(template.name || '').trim()
  if (!name) throw new Error('Template name is required')
  const nextModeRaw = String(template.nextKnowledgeMode || 'noTemplate')
  const nextKnowledgeMode =
    nextModeRaw === 'existingTemplate' || nextModeRaw === 'maxLevel' || nextModeRaw === 'noTemplate'
      ? nextModeRaw
      : 'noTemplate'
  const nextKnowledgeTemplate = String(template.nextKnowledgeTemplate || '').trim()
  const normalizedNextTemplate = nextKnowledgeMode === 'existingTemplate' ? nextKnowledgeTemplate : ''
  const knowledgeLevel = Math.max(1, Number(template.knowledgeLevel) || 1)

  if (type === 'tenetKnowledge') {
    return {
      name,
      observation: String(template.observation || '').trim(),
      rules: String(template.rules || '').trim(),
      observationRequirement: Math.max(0, Number(template.observationRequirement) || 0),
      knowledgeLevel,
      nextKnowledgeMode,
      nextKnowledgeTemplate: normalizedNextTemplate
    }
  }

  if (type === 'knowledge') {
    return {
      name,
      observation: String(template.observation || '').trim(),
      rules: String(template.rules || '').trim(),
      observationRequirement: Math.max(0, Number(template.observationRequirement) || 0),
      knowledgeLevel,
      nextKnowledgeMode,
      nextKnowledgeTemplate: normalizedNextTemplate
    }
  }

  throw new Error('Invalid knowledge template type')
}

function saveKnowledgeTemplate(basePath, type, template) {
  const folder = getKnowledgeTemplateFolder(basePath, type)
  fs.mkdirSync(folder, { recursive: true })

  const normalized = sanitizeKnowledgeTemplate(type, template)
  const safeName = slugify(normalized.name)
  if (!safeName) throw new Error('Template name must include letters or numbers')

  const fileName = `${safeName}-${Math.max(1, Number(normalized.knowledgeLevel) || 1)}.json`
  fs.writeFileSync(path.join(folder, fileName), JSON.stringify(normalized, null, 2), 'utf8')
  return fileName
}

function listKnowledgeTemplates(basePath, type) {
  const folder = getKnowledgeTemplateFolder(basePath, type)
  if (!fs.existsSync(folder)) return []

  return fs
    .readdirSync(folder, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => {
      try {
        const fileName = entry.name
        const fullPath = path.join(folder, fileName)
        const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
        const template = sanitizeKnowledgeTemplate(type, raw)
        return {
          id: fileName,
          fileName,
          name: template.name,
          template
        }
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
}

function sanitizeNeurosisTemplate(template) {
  if (!template || typeof template !== 'object') throw new Error('Invalid neurosis template payload')
  const name = String(template.name || '').trim()
  const neurosis = String(template.neurosis || '').trim()
  if (!name) throw new Error('Template name is required')
  if (!neurosis) throw new Error('Neurosis text is required')
  return { name, neurosis }
}

function saveNeurosisTemplate(basePath, template) {
  if (typeof basePath !== 'string' || basePath.trim().length === 0) {
    throw new Error('Neuroses template folder is not configured')
  }
  const folder = basePath.trim()
  fs.mkdirSync(folder, { recursive: true })
  const normalized = sanitizeNeurosisTemplate(template)
  const safeName = slugify(normalized.name)
  if (!safeName) throw new Error('Template name must include letters or numbers')
  const fileName = `${safeName}.json`
  fs.writeFileSync(path.join(folder, fileName), JSON.stringify(normalized, null, 2), 'utf8')
  return fileName
}

function listNeurosisTemplates(basePath) {
  if (typeof basePath !== 'string' || basePath.trim().length === 0) return []
  const folder = basePath.trim()
  if (!fs.existsSync(folder)) return []

  return fs
    .readdirSync(folder, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => {
      try {
        const fileName = entry.name
        const fullPath = path.join(folder, fileName)
        const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
        const template = sanitizeNeurosisTemplate(raw)
        return {
          id: fileName,
          fileName,
          name: template.name,
          neurosis: template.neurosis
        }
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
}

module.exports = {
  SOURCE_KEYS,
  ensureFolderStructure,
  saveConfig,
  setDataSource,
  getSavedDataSources,
  getSavedDataFolder,
  ensureDataFolderConfigured,
  savePerson,
  loadPerson,
  listPeople,
  deletePerson,
  createPersonTemplate,
  saveDefaultCreateTemplate,
  loadDefaultCreateTemplate,
  listMarkdownCollections,
  listMarkdownFiles,
  loadMarkdownFile,
  saveKnowledgeTemplate,
  listKnowledgeTemplates,
  saveNeurosisTemplate,
  listNeurosisTemplates,
  ConflictError,
  ValidationError
}
