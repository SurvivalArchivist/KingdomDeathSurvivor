const { app, BrowserWindow, ipcMain, dialog, nativeImage, Menu } = require('electron')
const fs = require('fs')
const dgram = require('dgram')
const http = require('http')
const https = require('https')
const os = require('os')
const path = require('path')
const MarkdownIt = require('markdown-it')
const dataService = require('./dataService')
const { createLanSurvivorHost } = require('./lanSurvivorHost')
const { createSurvivorProvider, normalizeLanHostBaseUrl } = require('./survivorProvider')

let mainWindow
let lanSurvivorHost
let lanClientEventRequest = null
let lanClientEventReconnectTimer = null
let lanClientEventBuffer = ''
let lanClientEventGeneration = 0
let lanClientEventState = { connected: false, errorMessage: '' }
let lanDiscoverySocket = null
let lanDiscoveryAdvertiseTimer = null
const discoveredLanHosts = new Map()
const appIconSvgPath = path.join(__dirname, '..', 'ui', 'assets', 'app-icon.svg')
const appIconPngPath = path.join(__dirname, '..', 'ui', 'assets', 'app-icon.png')
const LAN_DISCOVERY_PORT = 3766
const LAN_DISCOVERY_STALE_MS = 15000
const LAN_DISCOVERY_ADVERTISE_MS = 3000
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

function getAppIconPath() {
  if (fs.existsSync(appIconPngPath)) return appIconPngPath
  return appIconSvgPath
}

function sendFullScreenState(windowRef = mainWindow) {
  if (!windowRef || typeof windowRef.isDestroyed === 'function' && windowRef.isDestroyed()) return
  windowRef.webContents.send('window-full-screen-changed', Boolean(windowRef.isFullScreen()))
}

function createWindow() {
  const iconPath = getAppIconPath()
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.platform === 'win32') {
    mainWindow.setMenuBarVisibility(false)
  }
  mainWindow.on('enter-full-screen', () => sendFullScreenState(mainWindow))
  mainWindow.on('leave-full-screen', () => sendFullScreenState(mainWindow))
  mainWindow.loadFile(path.join(__dirname, '..', 'ui', 'components', 'index.html'))
}

function getSurvivorProvider() {
  return createSurvivorProvider({ app, dataService })
}

function getLanSurvivorHost() {
  if (!lanSurvivorHost) {
    lanSurvivorHost = createLanSurvivorHost({ app, dataService })
  }
  return lanSurvivorHost
}

function getSurvivorErrorPayload(err) {
  if (err instanceof dataService.ConflictError) {
    return {
      ok: false,
      errorType: 'conflict',
      message: err.message
    }
  }
  if (err instanceof dataService.ValidationError) {
    return {
      ok: false,
      errorType: 'validation',
      message: err.message,
      errors: err.validationErrors
    }
  }
  if (err && err.name === 'LanClientError') {
    return {
      ok: false,
      errorType: err.errorType || 'host-unavailable',
      message: err.message || 'LAN survivor request failed'
    }
  }
  return null
}

function getLocalLanAddresses() {
  const interfaces = os.networkInterfaces()
  const addresses = []
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family !== 'IPv4' || entry.internal) continue
      addresses.push(entry.address)
    }
  }
  return [...new Set(addresses)].sort((a, b) => a.localeCompare(b))
}

function formatBackupTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-')
}

function isSameOrInsidePath(parentPath, childPath) {
  const relative = path.relative(parentPath, childPath)
  return relative === '' || Boolean(relative && !relative.startsWith('..') && !path.isAbsolute(relative))
}

async function exportSurvivorDataBackup() {
  const sourcePath = dataService.ensureDataFolderConfigured(app)
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Choose Backup Destination'
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const destinationRoot = result.filePaths[0]
  const backupPath = path.join(destinationRoot, `kdm-survivor-backup-${formatBackupTimestamp()}`)
  const resolvedSource = path.resolve(sourcePath)
  const resolvedBackup = path.resolve(backupPath)
  if (isSameOrInsidePath(resolvedSource, resolvedBackup)) {
    throw new Error('Choose a backup destination outside the survivor data folder')
  }
  fs.cpSync(resolvedSource, resolvedBackup, {
    recursive: true,
    errorOnExist: true,
    force: false
  })
  return {
    ok: true,
    sourcePath,
    backupPath
  }
}

function sendRendererEvent(channel, payload) {
  if (!mainWindow || typeof mainWindow.isDestroyed === 'function' && mainWindow.isDestroyed()) return
  mainWindow.webContents.send(channel, payload)
}

function sendLanConnectionStatusChanged() {
  getLanConnectionStatus()
    .then(status => sendRendererEvent('lan-connection-status-changed', status))
    .catch(() => {
      sendRendererEvent('lan-connection-status-changed', {
        mode: 'lan-client',
        state: 'error',
        label: 'Error',
        message: 'LAN status unavailable'
      })
    })
}

async function syncLanHostService() {
  const settings = dataService.getSavedAppSettings(app)
  const shouldHost = settings.survivorDataMode === 'lan-host' && settings.lanHostEnabled
  if (!shouldHost) {
    return getLanSurvivorHost().stop()
  }
  return getLanSurvivorHost().start(settings.lanPort)
}

function getLanHostInfo() {
  const settings = dataService.getSavedAppSettings(app)
  const hostStatus = getLanSurvivorHost().getStatus()
  const port = hostStatus.port || settings.lanPort || 3765
  const addresses = getLocalLanAddresses()
  return {
    running: Boolean(hostStatus.running),
    port,
    addresses,
    urls: addresses.map(address => `http://${address}:${port}`)
  }
}

function pruneDiscoveredLanHosts(now = Date.now()) {
  for (const [key, host] of discoveredLanHosts.entries()) {
    if (now - Number(host.lastSeen || 0) > LAN_DISCOVERY_STALE_MS) discoveredLanHosts.delete(key)
  }
}

function getLanDiscoveredHosts() {
  pruneDiscoveredLanHosts()
  return [...discoveredLanHosts.values()]
    .map(host => ({
      id: host.id,
      address: host.address,
      port: host.port,
      url: host.url,
      displayName: host.displayName,
      lastSeen: host.lastSeen
    }))
    .sort((a, b) => String(a.displayName || a.address).localeCompare(String(b.displayName || b.address)))
}

function handleLanDiscoveryMessage(message, rinfo = {}) {
  let payload = null
  try {
    payload = JSON.parse(message.toString('utf8'))
  } catch {
    return
  }
  if (payload?.type !== 'kdm-survivor-host' || payload?.version !== 1) return
  const address = String(rinfo.address || '').trim()
  const port = Number(payload.port)
  if (!address || !Number.isInteger(port) || port < 1024 || port > 65535) return
  const displayName = String(payload.displayName || '').trim()
  const id = `${address}:${port}`
  discoveredLanHosts.set(id, {
    id,
    address,
    port,
    url: `http://${address}:${port}`,
    displayName,
    lastSeen: Date.now()
  })
  sendRendererEvent('lan-discovered-hosts-changed', getLanDiscoveredHosts())
}

function advertiseLanHost() {
  if (!lanDiscoverySocket) return
  const settings = dataService.getSavedAppSettings(app)
  const hostStatus = getLanSurvivorHost().getStatus()
  if (settings.survivorDataMode !== 'lan-host' || !settings.lanHostEnabled || !hostStatus.running) return
  const payload = Buffer.from(JSON.stringify({
    type: 'kdm-survivor-host',
    version: 1,
    displayName: settings.lanDisplayName || settings.userName || '',
    port: hostStatus.port || settings.lanPort || 3765
  }))
  try {
    lanDiscoverySocket.send(payload, 0, payload.length, LAN_DISCOVERY_PORT, '255.255.255.255')
  } catch {
    // Discovery is best-effort; manual host entry still works.
  }
}

function startLanDiscoveryService() {
  if (lanDiscoverySocket) return
  const handleDiscoveryUnavailable = err => {
    if (err && err.code !== 'EPERM' && err.code !== 'EACCES' && err.code !== 'EADDRINUSE') {
      console.error('LAN discovery unavailable:', err)
    }
    stopLanDiscoveryService()
  }
  try {
    lanDiscoverySocket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
    lanDiscoverySocket.on('message', handleLanDiscoveryMessage)
    lanDiscoverySocket.on('error', handleDiscoveryUnavailable)
    lanDiscoverySocket.bind(LAN_DISCOVERY_PORT, () => {
      try {
        lanDiscoverySocket.setBroadcast(true)
      } catch {
        // Some environments disallow broadcast; manual host entry remains available.
      }
      advertiseLanHost()
    })
    lanDiscoveryAdvertiseTimer = setInterval(advertiseLanHost, LAN_DISCOVERY_ADVERTISE_MS)
    lanDiscoveryAdvertiseTimer.unref?.()
  } catch (err) {
    handleDiscoveryUnavailable(err)
  }
}

function stopLanDiscoveryService() {
  if (lanDiscoveryAdvertiseTimer) {
    clearInterval(lanDiscoveryAdvertiseTimer)
    lanDiscoveryAdvertiseTimer = null
  }
  if (lanDiscoverySocket) {
    const socket = lanDiscoverySocket
    lanDiscoverySocket = null
    try {
      socket.close()
    } catch {
      // Ignore discovery socket cleanup failures.
    }
  }
}

function stopLanClientEventStream() {
  lanClientEventGeneration += 1
  if (lanClientEventReconnectTimer) {
    clearTimeout(lanClientEventReconnectTimer)
    lanClientEventReconnectTimer = null
  }
  if (lanClientEventRequest) {
    try {
      lanClientEventRequest.destroy()
    } catch {
      // Ignore stream cleanup failures.
    }
  }
  lanClientEventRequest = null
  lanClientEventBuffer = ''
  lanClientEventState = { connected: false, errorMessage: '' }
}

function isCurrentLanClientEventGeneration(generation) {
  return generation === lanClientEventGeneration
}

function shouldRunLanClientEventStream(settings = dataService.getSavedAppSettings(app)) {
  return (
    settings.survivorDataMode === 'lan-client' &&
    settings.lanClientConnected !== false &&
    Boolean(String(settings.lanHostAddress || '').trim())
  )
}

function parseSseEvent(rawEvent) {
  let eventName = 'message'
  const dataLines = []
  for (const rawLine of rawEvent.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    if (!line || line.startsWith(':')) continue
    const separatorIndex = line.indexOf(':')
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex)
    const value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1).replace(/^ /, '')
    if (field === 'event') eventName = value
    if (field === 'data') dataLines.push(value)
  }
  return { eventName, data: dataLines.join('\n') }
}

function handleLanClientEventChunk(chunk, generation) {
  if (!isCurrentLanClientEventGeneration(generation)) return
  lanClientEventBuffer += chunk
  const events = lanClientEventBuffer.split(/\r?\n\r?\n/)
  lanClientEventBuffer = events.pop() || ''
  for (const rawEvent of events) {
    const parsed = parseSseEvent(rawEvent)
    if (parsed.eventName !== 'survivor-data-changed') continue
    let payload = null
    try {
      payload = JSON.parse(parsed.data)
    } catch {
      payload = { action: 'unknown' }
    }
    sendRendererEvent('lan-survivor-data-changed', payload)
  }
}

function scheduleLanClientEventReconnect(delayMs = 5000, generation = lanClientEventGeneration) {
  if (!isCurrentLanClientEventGeneration(generation)) return
  const settings = dataService.getSavedAppSettings(app)
  if (!settings.lanAutoReconnect || !shouldRunLanClientEventStream(settings)) return
  if (lanClientEventReconnectTimer) return
  lanClientEventReconnectTimer = setTimeout(() => {
    lanClientEventReconnectTimer = null
    if (!isCurrentLanClientEventGeneration(generation)) return
    syncLanClientEventStream()
  }, delayMs)
}

function markLanClientEventDisconnected(message, generation = lanClientEventGeneration) {
  if (!isCurrentLanClientEventGeneration(generation)) return
  lanClientEventState = { connected: false, errorMessage: String(message || 'LAN event stream disconnected') }
  sendLanConnectionStatusChanged()
}

function syncLanClientEventStream() {
  const settings = dataService.getSavedAppSettings(app)
  stopLanClientEventStream()

  if (!shouldRunLanClientEventStream(settings)) return

  let baseUrl
  try {
    baseUrl = normalizeLanHostBaseUrl(settings)
  } catch {
    lanClientEventState = { connected: false, errorMessage: 'Invalid LAN host settings' }
    return
  }

  let eventUrl
  try {
    eventUrl = new URL('/events', baseUrl)
  } catch {
    lanClientEventState = { connected: false, errorMessage: 'Invalid LAN host event URL' }
    return
  }

  const transport = eventUrl.protocol === 'https:' ? https : http
  const generation = ++lanClientEventGeneration
  lanClientEventState = { connected: false, errorMessage: 'LAN event stream connecting' }
  sendLanConnectionStatusChanged()
  const request = transport.request(eventUrl, {
    method: 'GET',
    headers: { accept: 'text/event-stream' }
  }, response => {
    if (!isCurrentLanClientEventGeneration(generation)) {
      response.resume()
      return
    }
    if (response.statusCode !== 200) {
      markLanClientEventDisconnected(`LAN event stream returned ${response.statusCode}`, generation)
      response.resume()
      scheduleLanClientEventReconnect(5000, generation)
      return
    }
    lanClientEventState = { connected: true, errorMessage: '' }
    sendLanConnectionStatusChanged()
    response.setEncoding('utf8')
    response.on('data', chunk => handleLanClientEventChunk(chunk, generation))

    let responseClosed = false
    const handleResponseDisconnect = message => {
      if (responseClosed) return
      responseClosed = true
      markLanClientEventDisconnected(message, generation)
      scheduleLanClientEventReconnect(5000, generation)
    }
    response.on('end', () => handleResponseDisconnect('LAN event stream ended'))
    response.on('close', () => handleResponseDisconnect('LAN event stream closed'))
    response.on('error', err => handleResponseDisconnect(err.message || 'LAN event stream failed'))
  })
  lanClientEventRequest = request
  request.on('error', err => {
    markLanClientEventDisconnected(err.message || 'LAN event stream failed', generation)
    scheduleLanClientEventReconnect(5000, generation)
  })
  request.end()
}

async function getLanConnectionStatus() {
  const settings = dataService.getSavedAppSettings(app)
  const mode = settings.survivorDataMode || 'local'

  if (mode === 'local') {
    return { mode, state: 'local', label: 'Local', message: 'Using local survivor files' }
  }

  if (mode === 'lan-host') {
    const hostStatus = getLanSurvivorHost().getStatus()
    if (settings.lanHostEnabled && hostStatus.running) {
      return {
        mode,
        state: 'hosting',
        label: 'Hosting',
        message: `Hosting survivor data on port ${hostStatus.port || settings.lanPort}`
      }
    }
    return {
      mode,
      state: settings.lanHostEnabled ? 'error' : 'offline',
      label: settings.lanHostEnabled ? 'Error' : 'Offline',
      message: settings.lanHostEnabled ? 'LAN host is enabled but not running' : 'LAN host is not enabled'
    }
  }

  if (mode === 'lan-client') {
    if (settings.lanClientConnected === false) {
      return { mode, state: 'offline', label: 'Offline', message: 'LAN client is disconnected' }
    }

    let baseUrl
    try {
      baseUrl = normalizeLanHostBaseUrl(settings)
    } catch (err) {
      return {
        mode,
        state: 'error',
        label: 'Error',
        message: err.message || 'Invalid LAN host settings'
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1200)
    try {
      const response = await fetch(`${baseUrl}/health`, {
        headers: { accept: 'application/json' },
        signal: controller.signal
      })
      if (!response.ok) {
        return { mode, state: 'offline', label: 'Offline', message: `LAN host returned ${response.status}` }
      }
      const payload = await response.json().catch(() => null)
      const pushWaiting =
        settings.lanAutoReconnect &&
        settings.lanClientConnected !== false &&
        !lanClientEventState.connected &&
        Boolean(lanClientEventState.errorMessage)
      return {
        mode,
        state: payload?.ok === false ? 'offline' : pushWaiting ? 'reconnecting' : 'connected',
        label: payload?.ok === false ? 'Offline' : pushWaiting ? 'Reconnecting' : 'Connected',
        message:
          payload?.ok === false
            ? 'LAN host is unavailable'
            : pushWaiting
              ? 'Connected to LAN host; restoring live updates'
              : payload?.displayName
                ? `Connected to ${payload.displayName}`
                : 'Connected to LAN host',
        pushConnected: lanClientEventState.connected
      }
    } catch {
      return { mode, state: 'offline', label: 'Offline', message: 'LAN host is unavailable' }
    } finally {
      clearTimeout(timeout)
    }
  }

  return { mode, state: 'error', label: 'Error', message: 'Unknown survivor data mode' }
}

/* ------------------------------
   App Lifecycle
--------------------------------*/
app.whenReady().then(() => {
  if (process.platform === 'win32') {
    // Prevent Alt/menu mnemonic focus from stealing keyboard input from form fields.
    Menu.setApplicationMenu(null)
  }
  if (process.platform === 'darwin' && app.dock) {
    const dockIcon = nativeImage.createFromPath(getAppIconPath())
    if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon)
  }
  createWindow()
  syncLanHostService().catch(err => {
    console.error('Failed to start LAN survivor host:', err)
  })
  startLanDiscoveryService()
  syncLanClientEventStream()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
  stopLanDiscoveryService()
  stopLanClientEventStream()
  if (!lanSurvivorHost) return
  lanSurvivorHost.stop().catch(err => {
    console.error('Failed to stop LAN survivor host:', err)
  })
})

/* ------------------------------
   IPC Handlers
--------------------------------*/

ipcMain.handle('select-data-source-folder', async (_event, sourceKey) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const selectedPath = result.filePaths[0]
  const dataSources = dataService.setDataSource(app, sourceKey, selectedPath)
  return {
    sourceKey,
    folderPath: selectedPath,
    dataSources
  }
})

ipcMain.handle('get-saved-data-sources', () => {
  return dataService.getSavedDataSources(app)
})

ipcMain.handle('get-app-settings', () => {
  return dataService.getSavedAppSettings(app)
})

ipcMain.handle('save-app-settings', async (_event, settings) => {
  const saved = dataService.saveAppSettings(app, settings)
  try {
    await syncLanHostService()
  } catch (err) {
    if (saved?.survivorDataMode === 'lan-host' && saved?.lanHostEnabled) {
      dataService.saveAppSettings(app, { ...saved, lanHostEnabled: false })
    }
    throw err
  }
  advertiseLanHost()
  syncLanClientEventStream()
  return saved
})

ipcMain.handle('get-lan-connection-status', () => {
  return getLanConnectionStatus()
})

ipcMain.handle('get-lan-host-info', () => {
  return getLanHostInfo()
})

ipcMain.handle('get-lan-discovered-hosts', () => {
  return getLanDiscoveredHosts()
})

ipcMain.handle('export-survivor-data-backup', () => {
  return exportSurvivorDataBackup()
})

ipcMain.handle('list-people', async () => {
  return getSurvivorProvider().listPeople()
})

ipcMain.handle('list-people-summaries', async () => {
  return getSurvivorProvider().listPeopleSummaries()
})

ipcMain.handle('load-person', async (_event, fileName) => {
  return getSurvivorProvider().loadPerson(fileName)
})

ipcMain.handle('save-person', async (_event, person, options) => {
  try {
    const appSettings = dataService.getSavedAppSettings(app)
    const fileName = await getSurvivorProvider().savePerson(person, {
      ...(options && typeof options === 'object' ? options : {}),
      editorName: appSettings.userName || ''
    })
    return { ok: true, fileName }
  } catch (err) {
    const payload = getSurvivorErrorPayload(err)
    if (payload) return payload
    throw err
  }
})

ipcMain.handle('delete-person', async (_event, fileName) => {
  try {
    return await getSurvivorProvider().deletePerson(fileName)
  } catch (err) {
    const payload = getSurvivorErrorPayload(err)
    if (payload) return { deleted: false, ...payload }
    throw err
  }
})

ipcMain.handle('create-person-template', (_event, name) => {
  return dataService.createPersonTemplate(name)
})

ipcMain.handle('save-default-create-template', (_event, template) => {
  const dataSources = dataService.getSavedDataSources(app)
  const templatePath = String(dataSources.defaultSurvivorTemplates || '').trim()
  if (!templatePath) {
    throw new Error('No Default Survivor Templates folder selected')
  }
  const fileName = dataService.saveDefaultCreateTemplate(templatePath, template)
  return { ok: true, fileName }
})

ipcMain.handle('load-default-create-template', () => {
  const dataSources = dataService.getSavedDataSources(app)
  const templatePath = String(dataSources.defaultSurvivorTemplates || '').trim()
  if (!templatePath) return null
  return dataService.loadDefaultCreateTemplate(templatePath)
})

ipcMain.handle('list-markdown-collections', () => {
  const dataSources = dataService.getSavedDataSources(app)
  return dataService.listMarkdownCollections(dataSources)
})

ipcMain.handle('list-markdown-files', (_event, collectionId) => {
  const dataSources = dataService.getSavedDataSources(app)
  return dataService.listMarkdownFiles(dataSources, collectionId)
})

ipcMain.handle('load-markdown-file', (_event, collectionId, fileName) => {
  const dataSources = dataService.getSavedDataSources(app)
  const doc = dataService.loadMarkdownFile(dataSources, collectionId, fileName)
  return {
    ...doc,
    html: markdown.render(doc.markdown)
  }
})

function resolveKnowledgeTemplatePath(dataSources, type) {
  if (type !== 'tenetKnowledge' && type !== 'knowledge') throw new Error('Invalid knowledge template type')
  const primaryPath = String(dataSources.knowledges || '').trim()
  if (primaryPath) return primaryPath
  // Backward compatibility for older setups that configured a dedicated tenet folder.
  if (type === 'tenetKnowledge') {
    const legacyTenetPath = String(dataSources.tenetKnowledges || '').trim()
    if (legacyTenetPath) return legacyTenetPath
  }
  return ''
}

ipcMain.handle('save-knowledge-template', (_event, type, template) => {
  const dataSources = dataService.getSavedDataSources(app)
  const templatePath = resolveKnowledgeTemplatePath(dataSources, type)
  if (!templatePath) {
    throw new Error('No Knowledges folder selected')
  }
  const fileName = dataService.saveKnowledgeTemplate(templatePath, type, template)
  return { ok: true, fileName }
})

ipcMain.handle('list-knowledge-templates', (_event, type) => {
  const dataSources = dataService.getSavedDataSources(app)
  const templatePath = resolveKnowledgeTemplatePath(dataSources, type)
  if (!templatePath) return []
  return dataService.listKnowledgeTemplates(templatePath, type)
})

ipcMain.handle('save-neurosis-template', (_event, template) => {
  const dataSources = dataService.getSavedDataSources(app)
  const templatePath = String(dataSources.neuroses || '').trim()
  if (!templatePath) {
    throw new Error('No Neuroses folder selected')
  }
  const fileName = dataService.saveNeurosisTemplate(templatePath, template)
  return { ok: true, fileName }
})

ipcMain.handle('list-neurosis-templates', () => {
  const dataSources = dataService.getSavedDataSources(app)
  const templatePath = String(dataSources.neuroses || '').trim()
  if (!templatePath) return []
  return dataService.listNeurosisTemplates(templatePath)
})

ipcMain.handle('get-full-screen-state', () => {
  return { isFullScreen: Boolean(mainWindow && mainWindow.isFullScreen()) }
})

ipcMain.handle('toggle-full-screen', () => {
  if (!mainWindow) throw new Error('Main window is not available')
  const nextFullScreen = !mainWindow.isFullScreen()
  mainWindow.setFullScreen(nextFullScreen)
  return { isFullScreen: nextFullScreen }
})
