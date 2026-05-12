const test = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')

const { createLanSurvivorHost } = require('../src/lanSurvivorHost')

class ConflictError extends Error {}
class ValidationError extends Error {
  constructor(message, validationErrors) {
    super(message)
    this.validationErrors = validationErrors
  }
}

async function requestJson(host, path, options = {}) {
  const req = new EventEmitter()
  req.method = options.method || 'GET'
  req.url = path
  req.setEncoding = () => {}
  req.destroy = () => {}

  const response = await new Promise(resolve => {
    const res = {
      statusCode: null,
      headers: null,
      writeHead(statusCode, headers) {
        this.statusCode = statusCode
        this.headers = headers
      },
      end(body) {
        resolve({ status: this.statusCode, body: JSON.parse(body || '{}') })
      }
    }
    host.handleRequest(req, res)
    process.nextTick(() => {
      if (options.body) req.emit('data', options.body)
      req.emit('end')
    })
  })
  return response
}

async function openEventStream(host) {
  const req = new EventEmitter()
  req.method = 'GET'
  req.url = '/events'
  req.setEncoding = () => {}
  req.destroy = () => {}
  const chunks = []
  const res = new EventEmitter()
  res.statusCode = null
  res.headers = null
  res.writeHead = (statusCode, headers) => {
    res.statusCode = statusCode
    res.headers = headers
  }
  res.write = chunk => {
    chunks.push(String(chunk))
  }
  res.end = () => {
    res.ended = true
  }
  await host.handleRequest(req, res)
  return { req, res, chunks }
}

function makeHost(overrides = {}, hostOptions = {}) {
  const calls = []
  const dataService = {
    ConflictError,
    ValidationError,
    getSavedAppSettings() {
      calls.push(['getSavedAppSettings'])
      return { userName: 'Host User', lanDisplayName: 'Lantern Host' }
    },
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
      return { records: [{ fileName: 'alice.json', name: 'Alice' }], unreadableCount: 0, totalFiles: 1 }
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
  const host = createLanSurvivorHost({ app: {}, dataService, host: '127.0.0.1', ...hostOptions })
  return { calls, host }
}

test('LAN survivor host exposes health and survivor read endpoints', async t => {
  const { calls, host } = makeHost()

  const health = await requestJson(host, '/health')
  assert.equal(health.status, 200)
  assert.equal(health.body.ok, true)
  assert.equal(health.body.mode, 'lan-host')
  assert.equal(health.body.displayName, 'Lantern Host')

  assert.deepEqual((await requestJson(host, '/survivors')).body, ['alice.json'])
  assert.deepEqual((await requestJson(host, '/survivors/summaries')).body.records, [
    { fileName: 'alice.json', name: 'Alice' }
  ])
  assert.deepEqual((await requestJson(host, '/survivors/alice.json')).body, { name: 'Alice' })
  assert.deepEqual(calls.filter(call => call[0] === 'listPeople'), [['listPeople', '/tmp/survivors']])
})

test('LAN survivor host saves and deletes survivors through dataService', async t => {
  const { calls, host } = makeHost()

  const post = await requestJson(host, '/survivors', {
    method: 'POST',
    body: JSON.stringify({ person: { name: 'Alice' }, options: { expectedRevision: 2 } })
  })
  assert.deepEqual(post, { status: 200, body: { ok: true, fileName: 'alice.json' } })

  const put = await requestJson(host, '/survivors/alice.json', {
    method: 'PUT',
    body: JSON.stringify({ person: { name: 'Alice Renamed' } })
  })
  assert.deepEqual(put, { status: 200, body: { ok: true, fileName: 'alice.json' } })

  const deleted = await requestJson(host, '/survivors/alice.json', { method: 'DELETE' })
  assert.deepEqual(deleted, { status: 200, body: { deleted: true } })
  assert.deepEqual(
    calls.filter(call => call[0] === 'savePerson' || call[0] === 'deletePerson'),
    [
      ['savePerson', '/tmp/survivors', { name: 'Alice' }, { expectedRevision: 2, editorName: 'Host User' }],
      ['savePerson', '/tmp/survivors', { name: 'Alice Renamed' }, { expectedFileName: 'alice.json', editorName: 'Host User' }],
      ['deletePerson', '/tmp/survivors', 'alice.json']
    ]
  )
})

test('LAN survivor host streams survivor data change events', async t => {
  const { host } = makeHost()
  const stream = await openEventStream(host)

  assert.equal(stream.res.statusCode, 200)
  assert.equal(stream.res.headers['content-type'], 'text/event-stream; charset=utf-8')
  assert.match(stream.chunks.join(''), /event: ready/)

  await requestJson(host, '/survivors', {
    method: 'POST',
    body: JSON.stringify({ person: { name: 'Alice' } })
  })

  const output = stream.chunks.join('')
  assert.match(output, /event: survivor-data-changed/)
  assert.match(output, /"action":"save"/)
  assert.match(output, /"fileName":"alice\.json"/)
  stream.req.emit('close')
})

test('LAN survivor host can recover after a failed start', async t => {
  let failNextListen = true
  let closeCalls = 0
  const fakeHttp = {
    createServer() {
      const server = new EventEmitter()
      server.listen = (_port, _host, callback) => {
        process.nextTick(() => {
          if (failNextListen) {
            failNextListen = false
            const err = new Error('listen EADDRINUSE')
            err.code = 'EADDRINUSE'
            server.emit('error', err)
            return
          }
          callback()
        })
      }
      server.address = () => ({ port: 3765 })
      server.close = callback => {
        closeCalls += 1
        process.nextTick(() => callback?.())
      }
      return server
    }
  }
  const { host } = makeHost({}, { httpModule: fakeHttp })
  t.after(async () => {
    await host.stop()
  })

  await assert.rejects(() => host.start(3765), /EADDRINUSE/)
  assert.deepEqual(host.getStatus(), { running: false, port: null })

  const retry = await host.start(3765)
  assert.deepEqual(retry, { running: true, port: 3765 })
  assert.deepEqual(host.getStatus(), { running: true, port: 3765 })
  assert.equal(closeCalls, 1)
})

test('LAN survivor host maps validation and conflict save errors to JSON payloads', async t => {
  const { host } = makeHost({
    savePerson(_basePath, person) {
      if (person.name === 'Conflict') throw new ConflictError('stale survivor')
      throw new ValidationError('invalid survivor', [{ path: '/name' }])
    }
  })

  const conflict = await requestJson(host, '/survivors/conflict.json', {
    method: 'PUT',
    body: JSON.stringify({ name: 'Conflict' })
  })
  assert.equal(conflict.status, 409)
  assert.equal(conflict.body.errorType, 'conflict')

  const validation = await requestJson(host, '/survivors', {
    method: 'POST',
    body: JSON.stringify({ name: '' })
  })
  assert.equal(validation.status, 400)
  assert.equal(validation.body.errorType, 'validation')
  assert.deepEqual(validation.body.errors, [{ path: '/name' }])
})
