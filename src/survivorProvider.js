const SURVIVOR_DATA_MODES = Object.freeze({
  LOCAL: 'local',
  LAN_HOST: 'lan-host',
  LAN_CLIENT: 'lan-client'
})

function normalizeSurvivorDataMode(value) {
  const mode = String(value || '').trim()
  if (mode === SURVIVOR_DATA_MODES.LAN_HOST || mode === SURVIVOR_DATA_MODES.LAN_CLIENT) return mode
  return SURVIVOR_DATA_MODES.LOCAL
}

function createLocalSurvivorProvider({ app, dataService, mode = SURVIVOR_DATA_MODES.LOCAL }) {
  if (!app) throw new Error('Survivor provider requires an app instance')
  if (!dataService) throw new Error('Survivor provider requires dataService')

  function getDataPath() {
    return dataService.ensureDataFolderConfigured(app)
  }

  return {
    mode,
    getSettlementRecord() {
      return dataService.getSettlementRecord(getDataPath())
    },
    getSettlementWarning() {
      return dataService.getSettlementWarning?.(getDataPath()) || null
    },
    listPeople() {
      return dataService.listPeople(getDataPath())
    },
    listPeopleSummaries() {
      return dataService.listPeopleSummaries(getDataPath())
    },
    loadPerson(fileName) {
      return dataService.loadPerson(getDataPath(), fileName)
    },
    savePerson(person, options = {}) {
      return dataService.savePerson(getDataPath(), person, options)
    },
    deletePerson(fileName) {
      dataService.deletePerson(getDataPath(), fileName)
      return { deleted: true }
    }
  }
}

function normalizeLanHostBaseUrl(settings = {}) {
  const rawAddress = String(settings.lanHostAddress || '').trim()
  if (!rawAddress) throw new Error('No LAN host address configured')

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(rawAddress) ? rawAddress : `http://${rawAddress}`
  let url
  try {
    url = new URL(withProtocol)
  } catch {
    throw new Error('Invalid LAN host address')
  }

  const port = Number(settings.lanPort)
  if (!url.port && Number.isInteger(port) && port >= 1024 && port <= 65535) {
    url.port = String(port)
  }
  url.pathname = ''
  url.search = ''
  url.hash = ''
  return url.origin
}

function createLanClientError(message, cause, errorType = 'host-unavailable') {
  const error = new Error(message)
  error.name = 'LanClientError'
  error.errorType = errorType
  if (cause) error.cause = cause
  return error
}

async function readLanResponseJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function throwLanApiError(dataService, payload, fallbackMessage) {
  const message = payload && typeof payload.message === 'string' ? payload.message : fallbackMessage
  if (payload?.errorType === 'conflict') {
    throw new dataService.ConflictError(message)
  }
  if (payload?.errorType === 'validation') {
    throw new dataService.ValidationError(message, Array.isArray(payload.errors) ? payload.errors : [])
  }
  throw createLanClientError(message || 'LAN host request failed', null, payload?.errorType || 'server-error')
}

function createLanClientSurvivorProvider({ settings, dataService, fetchImpl = globalThis.fetch }) {
  if (!dataService) throw new Error('Survivor provider requires dataService')
  if (typeof fetchImpl !== 'function') throw new Error('LAN client provider requires fetch support')
  if (settings?.lanClientConnected === false) throw createLanClientError('LAN client is disconnected', null, 'disconnected')

  const baseUrl = normalizeLanHostBaseUrl(settings)
  let settlementWarning = null

  async function requestJson(path, options = {}) {
    let response
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        ...options,
        headers: {
          accept: 'application/json',
          ...(options.body ? { 'content-type': 'application/json' } : {}),
          ...(options.headers || {})
        }
      })
    } catch (err) {
      throw createLanClientError(`Cannot reach LAN host at ${baseUrl}`, err, 'host-unavailable')
    }

    const payload = await readLanResponseJson(response)
    if (!response.ok) {
      throwLanApiError(dataService, payload, `LAN host request failed (${response.status})`)
    }
    if (payload && typeof payload === 'object' && payload.ok === false) {
      throwLanApiError(dataService, payload, 'LAN host request failed')
    }
    return payload
  }

  function survivorPath(fileName) {
    return `/survivors/${encodeURIComponent(String(fileName || ''))}`
  }

  return {
    mode: SURVIVOR_DATA_MODES.LAN_CLIENT,
    getSettlementRecord() {
      return requestJson('/settlement')
    },
    getSettlementWarning() { return settlementWarning },
    listPeople() {
      return requestJson('/survivors')
    },
    listPeopleSummaries() {
      return requestJson('/survivors/summaries')
    },
    loadPerson(fileName) {
      return requestJson(survivorPath(fileName))
    },
    async savePerson(person, options = {}) {
      const expectedFileName = typeof options.expectedFileName === 'string' && options.expectedFileName.trim()
      const response = await requestJson(expectedFileName ? survivorPath(expectedFileName) : '/survivors', {
        method: expectedFileName ? 'PUT' : 'POST',
        body: JSON.stringify({ person, options })
      })
      settlementWarning = response?.settlementWarning || null
      return response?.fileName
    },
    deletePerson(fileName) {
      return requestJson(survivorPath(fileName), { method: 'DELETE' })
    }
  }
}

function createSurvivorProvider({ app, dataService, fetchImpl }) {
  const settings = dataService.getSavedAppSettings(app)
  const mode = normalizeSurvivorDataMode(settings.survivorDataMode)

  if (mode === SURVIVOR_DATA_MODES.LOCAL || mode === SURVIVOR_DATA_MODES.LAN_HOST) {
    return createLocalSurvivorProvider({ app, dataService, mode })
  }

  return createLanClientSurvivorProvider({ settings, dataService, fetchImpl })
}

module.exports = {
  SURVIVOR_DATA_MODES,
  normalizeLanHostBaseUrl,
  normalizeSurvivorDataMode,
  createLanClientSurvivorProvider,
  createLocalSurvivorProvider,
  createSurvivorProvider
}
