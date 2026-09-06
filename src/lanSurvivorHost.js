const http = require('http')

const DEFAULT_HOST = '0.0.0.0'
const MAX_BODY_BYTES = 1024 * 1024
const SSE_RETRY_MS = 5000
const SSE_HEARTBEAT_MS = 25000

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type'
  })
  res.end(body)
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', chunk => {
      body += chunk
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!body.trim()) {
        resolve(null)
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON request body'))
      }
    })
    req.on('error', reject)
  })
}

function getRoute(req) {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const parts = url.pathname.split('/').filter(Boolean).map(part => decodeURIComponent(part))
  return { method: String(req.method || 'GET').toUpperCase(), parts }
}

function getPersonPayload(body) {
  if (body && typeof body === 'object' && body.person && typeof body.person === 'object') return body.person
  return body
}

function getOptionsPayload(body) {
  if (body && typeof body === 'object' && body.options && typeof body.options === 'object') return body.options
  return {}
}

function createLanSurvivorHost({ app, dataService, host = DEFAULT_HOST, httpModule = http } = {}) {
  if (!app) throw new Error('LAN survivor host requires an app instance')
  if (!dataService) throw new Error('LAN survivor host requires dataService')

  let server = null
  let activePort = null
  let eventSequence = 0
  const eventClients = new Set()
  const eventClientHeartbeats = new Map()

  function getDataPath() {
    return dataService.ensureDataFolderConfigured(app)
  }

  function getSettings() {
    return dataService.getSavedAppSettings(app)
  }

  function handleSaveError(err) {
    if (err instanceof dataService.ConflictError) {
      return {
        statusCode: 409,
        payload: { ok: false, errorType: 'conflict', message: err.message }
      }
    }
    if (err instanceof dataService.ValidationError) {
      return {
        statusCode: 400,
        payload: {
          ok: false,
          errorType: 'validation',
          message: err.message,
          errors: err.validationErrors
        }
      }
    }
    throw err
  }

  function writeSse(res, eventName, payload) {
    res.write(`event: ${eventName}\n`)
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  function removeEventClient(res) {
    eventClients.delete(res)
    const heartbeat = eventClientHeartbeats.get(res)
    if (heartbeat) clearInterval(heartbeat)
    eventClientHeartbeats.delete(res)
  }

  function registerEventClient(req, res) {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'access-control-allow-origin': '*'
    })
    res.write(`retry: ${SSE_RETRY_MS}\n\n`)
    writeSse(res, 'ready', {
      ok: true,
      mode: 'lan-host',
      port: activePort
    })
    eventClients.add(res)
    const heartbeat = setInterval(() => {
      try {
        res.write(': keepalive\n\n')
      } catch {
        removeEventClient(res)
      }
    }, SSE_HEARTBEAT_MS)
    heartbeat.unref?.()
    eventClientHeartbeats.set(res, heartbeat)

    const removeClient = () => {
      removeEventClient(res)
    }
    req.on('close', removeClient)
    res.on?.('close', removeClient)
  }

  function broadcastSurvivorDataChange(action, fileName) {
    const payload = {
      action,
      fileName,
      sequence: ++eventSequence,
      timestamp: new Date().toISOString()
    }
    for (const client of [...eventClients]) {
      try {
        writeSse(client, 'survivor-data-changed', payload)
      } catch {
        removeEventClient(client)
      }
    }
  }

  async function handleRequest(req, res) {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {})
      return
    }

    try {
      const { method, parts } = getRoute(req)
      const settings = getSettings()

      if (method === 'GET' && parts.length === 1 && parts[0] === 'health') {
        sendJson(res, 200, {
          ok: true,
          mode: 'lan-host',
          displayName: settings.lanDisplayName || '',
          port: activePort
        })
        return
      }

      if (method === 'GET' && parts.length === 1 && parts[0] === 'events') {
        registerEventClient(req, res)
        return
      }

      const dataPath = getDataPath()

      if (method === 'GET' && parts.length === 1 && parts[0] === 'survivors') {
        sendJson(res, 200, dataService.listPeople(dataPath))
        return
      }

      if (method === 'PUT' && parts.length === 1 && parts[0] === 'settlement') {
        sendJson(res, 403, { ok: false, errorType: 'forbidden', message: 'Only the LAN Host can edit the settlement.' })
        return
      }

      if (method === 'GET' && parts.length === 1 && parts[0] === 'settlement') {
        sendJson(res, 200, dataService.getSettlementRecord(dataPath))
        return
      }

      if (method === 'GET' && parts.length === 2 && parts[0] === 'survivors' && parts[1] === 'summaries') {
        sendJson(res, 200, dataService.listPeopleSummaries(dataPath))
        return
      }

      if (method === 'GET' && parts.length === 2 && parts[0] === 'survivors') {
        sendJson(res, 200, dataService.loadPerson(dataPath, parts[1]))
        return
      }

      if (method === 'POST' && parts.length === 1 && parts[0] === 'survivors') {
        const body = await readJsonBody(req)
        try {
          const fileName = dataService.savePerson(dataPath, getPersonPayload(body), {
            ...getOptionsPayload(body),
            editorName: settings.userName || settings.lanDisplayName || '',
            recordSettlementReturn: true
          })
          const settlementWarning = dataService.getSettlementWarning?.(dataPath)
          sendJson(res, 200, { ok: true, fileName, ...(settlementWarning ? { settlementWarning } : {}) })
          broadcastSurvivorDataChange('save', fileName)
        } catch (err) {
          const response = handleSaveError(err)
          sendJson(res, response.statusCode, response.payload)
        }
        return
      }

      if (method === 'PUT' && parts.length === 2 && parts[0] === 'survivors') {
        const body = await readJsonBody(req)
        try {
          const fileName = dataService.savePerson(dataPath, getPersonPayload(body), {
            ...getOptionsPayload(body),
            expectedFileName: getOptionsPayload(body).expectedFileName || parts[1],
            editorName: settings.userName || settings.lanDisplayName || '',
            recordSettlementReturn: true
          })
          const settlementWarning = dataService.getSettlementWarning?.(dataPath)
          sendJson(res, 200, { ok: true, fileName, ...(settlementWarning ? { settlementWarning } : {}) })
          broadcastSurvivorDataChange('save', fileName)
        } catch (err) {
          const response = handleSaveError(err)
          sendJson(res, response.statusCode, response.payload)
        }
        return
      }

      if (method === 'DELETE' && parts.length === 2 && parts[0] === 'survivors') {
        dataService.deletePerson(dataPath, parts[1])
        sendJson(res, 200, { deleted: true })
        broadcastSurvivorDataChange('delete', parts[1])
        return
      }

      sendJson(res, 404, { ok: false, errorType: 'not-found', message: 'Endpoint not found' })
    } catch (err) {
      const statusCode = err.message === 'Invalid JSON request body' || err.message === 'Request body is too large' ? 400 : 500
      sendJson(res, statusCode, {
        ok: false,
        errorType: statusCode === 400 ? 'bad-request' : 'server-error',
        message: err.message || 'LAN host request failed'
      })
    }
  }

  async function start(port) {
    const nextPort = Number(port)
    if (!Number.isInteger(nextPort) || nextPort < 0 || nextPort > 65535 || (nextPort > 0 && nextPort < 1024)) {
      throw new Error('Invalid LAN host port')
    }
    if (server && activePort === nextPort) return { running: true, port: activePort }
    await stop()
    const nextServer = httpModule.createServer((req, res) => {
      handleRequest(req, res).catch(err => {
        if (!res.headersSent) {
          sendJson(res, 500, {
            ok: false,
            errorType: 'server-error',
            message: err.message || 'LAN host request failed'
          })
          return
        }
        res.destroy(err)
      })
    })
    server = nextServer
    try {
      await new Promise((resolve, reject) => {
        nextServer.once('error', reject)
        nextServer.listen(nextPort, host, () => {
          nextServer.off('error', reject)
          const address = nextServer.address()
          activePort = address && typeof address === 'object' ? address.port : nextPort
          resolve()
        })
      })
    } catch (err) {
      if (server === nextServer) {
        server = null
        activePort = null
      }
      try {
        nextServer.close(() => {})
      } catch {
        // The server may not have opened far enough to close.
      }
      throw err
    }
    return { running: true, port: activePort }
  }

  async function stop() {
    if (!server) return { running: false, port: null }
    const currentServer = server
    server = null
    activePort = null
    for (const client of [...eventClients]) {
      try {
        client.end()
      } catch {
        // Ignore client cleanup failures while the host is stopping.
      }
      removeEventClient(client)
    }
    await new Promise((resolve, reject) => {
      currentServer.close(err => {
        if (err) reject(err)
        else resolve()
      })
    })
    return { running: false, port: null }
  }

  function getStatus() {
    return { running: Boolean(server), port: activePort }
  }

  return {
    start,
    stop,
    getStatus,
    handleRequest
  }
}

module.exports = {
  createLanSurvivorHost
}
