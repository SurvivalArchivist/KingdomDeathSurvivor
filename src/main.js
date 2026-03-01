const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron')
const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const dataService = require('./dataService')

let mainWindow
const appIconSvgPath = path.join(__dirname, '..', 'ui', 'assets', 'app-icon.svg')
const appIconPngPath = path.join(__dirname, '..', 'ui', 'assets', 'app-icon.png')
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

function getAppIconPath() {
  if (fs.existsSync(appIconPngPath)) return appIconPngPath
  return appIconSvgPath
}

function createWindow() {
  const iconPath = getAppIconPath()
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'ui', 'components', 'index.html'))
}

/* ------------------------------
   App Lifecycle
--------------------------------*/
app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    const dockIcon = nativeImage.createFromPath(getAppIconPath())
    if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon)
  }
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
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

ipcMain.handle('list-people', () => {
  const dataPath = dataService.ensureDataFolderConfigured(app)
  return dataService.listPeople(dataPath)
})

ipcMain.handle('load-person', (_event, fileName) => {
  const dataPath = dataService.ensureDataFolderConfigured(app)
  return dataService.loadPerson(dataPath, fileName)
})

ipcMain.handle('save-person', (_event, person, options) => {
  try {
    const dataPath = dataService.ensureDataFolderConfigured(app)
    const fileName = dataService.savePerson(dataPath, person, options)
    return { ok: true, fileName }
  } catch (err) {
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
    throw err
  }
})

ipcMain.handle('delete-person', (_event, fileName) => {
  const dataPath = dataService.ensureDataFolderConfigured(app)
  dataService.deletePerson(dataPath, fileName)
  return { deleted: true }
})

ipcMain.handle('create-person-template', (_event, name) => {
  return dataService.createPersonTemplate(name)
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
