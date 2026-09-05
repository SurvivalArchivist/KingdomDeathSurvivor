const test = require('node:test')
const assert = require('node:assert/strict')

const {
  SURVIVOR_DATA_MODES,
  createLanClientSurvivorProvider,
  createSurvivorProvider,
  normalizeLanHostBaseUrl,
  normalizeSurvivorDataMode
} = require('../src/survivorProvider')

class ConflictError extends Error {}

test('LAN client reads host settlement and preserves pending-registration warnings', async () => {
  const requests = []
  const provider = createLanClientSurvivorProvider({
    settings: { lanHostAddress: 'host', lanPort: 3765 },
    dataService: {},
    fetchImpl: async (url, options) => {
      requests.push([url, options.method])
      return { ok: true, json: async () => url.endsWith('/settlement') ? { id: 'host-settlement', knowledges: [] } : { ok: true, fileName: 'alice.json', settlementWarning: 'Registration pending' } }
    }
  })
  assert.equal((await provider.getSettlementRecord()).id, 'host-settlement')
  assert.equal(await provider.savePerson({ name: 'Alice' }), 'alice.json')
  assert.equal(provider.getSettlementWarning(), 'Registration pending')
  assert.equal(requests[0][0], 'http://host:3765/settlement')
})
class ValidationError extends Error {
  constructor(message, validationErrors) {
    super(message)
    this.validationErrors = validationErrors
  }
}

function makeDataService(overrides = {}) {
  const calls = []
  const dataService = {
    getSavedAppSettings() {
      calls.push(['getSavedAppSettings'])
      return { survivorDataMode: 'local' }
    },
    ConflictError,
    ValidationError,
    ensureDataFolderConfigured() {
      calls.push(['ensureDataFolderConfigured'])
      return '/tmp/survivors'
    },
    listPeople(basePath) {
      calls.push(['listPeople', basePath])
      return ['alice.json']
    },
    listPeopleSummaries(basePath) {
      calls.push(['listPeopleSummaries', basePath])
      return { records: [], unreadableCount: 0, totalFiles: 0 }
    },
    loadPerson(basePath, fileName) {
      calls.push(['loadPerson', basePath, fileName])
      return { name: 'Alice' }
    },
    savePerson(basePath, person, options) {
      calls.push(['savePerson', basePath, person, options])
      return 'alice.json'
    },
    deletePerson(basePath, fileName) {
      calls.push(['deletePerson', basePath, fileName])
    },
    ...overrides
  }
  return { calls, dataService }
}

test('normalizeSurvivorDataMode accepts only known modes', () => {
  assert.equal(normalizeSurvivorDataMode('local'), SURVIVOR_DATA_MODES.LOCAL)
  assert.equal(normalizeSurvivorDataMode('lan-host'), SURVIVOR_DATA_MODES.LAN_HOST)
  assert.equal(normalizeSurvivorDataMode('lan-client'), SURVIVOR_DATA_MODES.LAN_CLIENT)
  assert.equal(normalizeSurvivorDataMode('cloud'), SURVIVOR_DATA_MODES.LOCAL)
  assert.equal(normalizeSurvivorDataMode(''), SURVIVOR_DATA_MODES.LOCAL)
})

test('normalizeLanHostBaseUrl builds host URL from address and port', () => {
  assert.equal(normalizeLanHostBaseUrl({ lanHostAddress: '192.168.1.44', lanPort: 4567 }), 'http://192.168.1.44:4567')
  assert.equal(normalizeLanHostBaseUrl({ lanHostAddress: 'http://kdm-host:7777', lanPort: 4567 }), 'http://kdm-host:7777')
  assert.throws(() => normalizeLanHostBaseUrl({ lanHostAddress: '' }), /No LAN host address configured/)
})

test('local survivor provider wraps dataService survivor CRUD with configured folder', () => {
  const app = { name: 'app' }
  const { calls, dataService } = makeDataService()
  const provider = createSurvivorProvider({ app, dataService })

  assert.equal(provider.mode, 'local')
  assert.deepEqual(provider.listPeople(), ['alice.json'])
  assert.deepEqual(provider.listPeopleSummaries(), { records: [], unreadableCount: 0, totalFiles: 0 })
  assert.deepEqual(provider.loadPerson('alice.json'), { name: 'Alice' })
  assert.equal(provider.savePerson({ name: 'Alice' }, { expectedFileName: 'alice.json' }), 'alice.json')
  assert.deepEqual(provider.deletePerson('alice.json'), { deleted: true })

  assert.deepEqual(calls, [
    ['getSavedAppSettings'],
    ['ensureDataFolderConfigured'],
    ['listPeople', '/tmp/survivors'],
    ['ensureDataFolderConfigured'],
    ['listPeopleSummaries', '/tmp/survivors'],
    ['ensureDataFolderConfigured'],
    ['loadPerson', '/tmp/survivors', 'alice.json'],
    ['ensureDataFolderConfigured'],
    ['savePerson', '/tmp/survivors', { name: 'Alice' }, { expectedFileName: 'alice.json' }],
    ['ensureDataFolderConfigured'],
    ['deletePerson', '/tmp/survivors', 'alice.json']
  ])
})

test('LAN host survivor provider uses local data service as authoritative storage', () => {
  const { dataService } = makeDataService({
    getSavedAppSettings() {
      return { survivorDataMode: 'lan-host' }
    }
  })
  const provider = createSurvivorProvider({ app: {}, dataService })

  assert.equal(provider.mode, 'lan-host')
  assert.deepEqual(provider.listPeople(), ['alice.json'])
})

test('LAN client survivor provider calls host survivor endpoints', async () => {
  const requests = []
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options })
    if (url.endsWith('/survivors') && !options.method) return { ok: true, status: 200, json: async () => ['alice.json'] }
    if (url.endsWith('/survivors/summaries')) {
      return { ok: true, status: 200, json: async () => ({ records: [], unreadableCount: 0, totalFiles: 0 }) }
    }
    if (url.endsWith('/survivors/alice.json') && !options.method) {
      return { ok: true, status: 200, json: async () => ({ name: 'Alice' }) }
    }
    if (url.endsWith('/survivors') && options.method === 'POST') {
      return { ok: true, status: 200, json: async () => ({ ok: true, fileName: 'alice.json' }) }
    }
    if (url.endsWith('/survivors/alice.json') && options.method === 'PUT') {
      return { ok: true, status: 200, json: async () => ({ ok: true, fileName: 'alice-renamed.json' }) }
    }
    if (url.endsWith('/survivors/alice.json') && options.method === 'DELETE') {
      return { ok: true, status: 200, json: async () => ({ deleted: true }) }
    }
    throw new Error('unexpected request')
  }
  const { dataService } = makeDataService()
  const provider = createLanClientSurvivorProvider({
    settings: { lanHostAddress: '192.168.1.44', lanPort: 4567 },
    dataService,
    fetchImpl
  })

  assert.equal(provider.mode, 'lan-client')
  assert.deepEqual(await provider.listPeople(), ['alice.json'])
  assert.deepEqual(await provider.listPeopleSummaries(), { records: [], unreadableCount: 0, totalFiles: 0 })
  assert.deepEqual(await provider.loadPerson('alice.json'), { name: 'Alice' })
  assert.equal(await provider.savePerson({ name: 'Alice' }, {}), 'alice.json')
  assert.equal(await provider.savePerson({ name: 'Alice Renamed' }, { expectedFileName: 'alice.json' }), 'alice-renamed.json')
  assert.deepEqual(await provider.deletePerson('alice.json'), { deleted: true })
  assert.deepEqual(
    requests.map(request => [request.url, request.options.method || 'GET']),
    [
      ['http://192.168.1.44:4567/survivors', 'GET'],
      ['http://192.168.1.44:4567/survivors/summaries', 'GET'],
      ['http://192.168.1.44:4567/survivors/alice.json', 'GET'],
      ['http://192.168.1.44:4567/survivors', 'POST'],
      ['http://192.168.1.44:4567/survivors/alice.json', 'PUT'],
      ['http://192.168.1.44:4567/survivors/alice.json', 'DELETE']
    ]
  )
})

test('LAN client survivor provider maps host conflict and validation payloads', async () => {
  const { dataService } = makeDataService()
  const provider = createLanClientSurvivorProvider({
    settings: { lanHostAddress: '192.168.1.44', lanPort: 4567 },
    dataService,
    fetchImpl: async (_url, options = {}) => {
      if (options.method === 'POST') {
        return {
          ok: false,
          status: 400,
          json: async () => ({ ok: false, errorType: 'validation', message: 'invalid', errors: [{ path: '/name' }] })
        }
      }
      return {
        ok: false,
        status: 409,
        json: async () => ({ ok: false, errorType: 'conflict', message: 'stale' })
      }
    }
  })

  await assert.rejects(() => provider.loadPerson('alice.json'), ConflictError)
  await assert.rejects(
    async () => {
      await provider.savePerson({ name: '' })
    },
    err => err instanceof ValidationError && err.validationErrors[0].path === '/name'
  )
})

test('LAN client survivor provider marks unavailable host errors', async () => {
  const { dataService } = makeDataService()
  const provider = createLanClientSurvivorProvider({
    settings: { lanHostAddress: '192.168.1.44', lanPort: 4567 },
    dataService,
    fetchImpl: async () => {
      throw new Error('network down')
    }
  })

  await assert.rejects(
    () => provider.listPeople(),
    err =>
      err.name === 'LanClientError' &&
      err.errorType === 'host-unavailable' &&
      /Cannot reach LAN host at http:\/\/192\.168\.1\.44:4567/.test(err.message)
  )
})

test('createSurvivorProvider creates LAN client provider from settings', async () => {
  const { dataService } = makeDataService({
    getSavedAppSettings() {
      return { survivorDataMode: 'lan-client', lanHostAddress: 'kdm-host', lanPort: 3765 }
    }
  })
  const provider = createSurvivorProvider({
    app: {},
    dataService,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ['alice.json'] })
  })

  assert.equal(provider.mode, 'lan-client')
  assert.deepEqual(await provider.listPeople(), ['alice.json'])
})
