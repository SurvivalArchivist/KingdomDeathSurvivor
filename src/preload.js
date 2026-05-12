const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  selectDataSourceFolder: sourceKey => ipcRenderer.invoke('select-data-source-folder', sourceKey),
  getSavedDataSources: () => ipcRenderer.invoke('get-saved-data-sources'),
  getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
  saveAppSettings: settings => ipcRenderer.invoke('save-app-settings', settings),
  getLanConnectionStatus: () => ipcRenderer.invoke('get-lan-connection-status'),
  getLanHostInfo: () => ipcRenderer.invoke('get-lan-host-info'),
  getLanDiscoveredHosts: () => ipcRenderer.invoke('get-lan-discovered-hosts'),
  exportSurvivorDataBackup: () => ipcRenderer.invoke('export-survivor-data-backup'),
  getFullScreenState: () => ipcRenderer.invoke('get-full-screen-state'),
  toggleFullScreen: () => ipcRenderer.invoke('toggle-full-screen'),
  onFullScreenChanged: listener => {
    if (typeof listener !== 'function') return () => {}
    const wrapped = (_event, isFullScreen) => listener(Boolean(isFullScreen))
    ipcRenderer.on('window-full-screen-changed', wrapped)
    return () => {
      ipcRenderer.removeListener('window-full-screen-changed', wrapped)
    }
  },
  onLanConnectionStatusChanged: listener => {
    if (typeof listener !== 'function') return () => {}
    const wrapped = (_event, status) => listener(status)
    ipcRenderer.on('lan-connection-status-changed', wrapped)
    return () => {
      ipcRenderer.removeListener('lan-connection-status-changed', wrapped)
    }
  },
  onLanSurvivorDataChanged: listener => {
    if (typeof listener !== 'function') return () => {}
    const wrapped = (_event, payload) => listener(payload)
    ipcRenderer.on('lan-survivor-data-changed', wrapped)
    return () => {
      ipcRenderer.removeListener('lan-survivor-data-changed', wrapped)
    }
  },
  onLanDiscoveredHostsChanged: listener => {
    if (typeof listener !== 'function') return () => {}
    const wrapped = (_event, hosts) => listener(hosts)
    ipcRenderer.on('lan-discovered-hosts-changed', wrapped)
    return () => {
      ipcRenderer.removeListener('lan-discovered-hosts-changed', wrapped)
    }
  },
  listPeople: () => ipcRenderer.invoke('list-people'),
  listPeopleSummaries: () => ipcRenderer.invoke('list-people-summaries'),
  loadPerson: fileName => ipcRenderer.invoke('load-person', fileName),
  savePerson: (person, options) => ipcRenderer.invoke('save-person', person, options),
  deletePerson: fileName => ipcRenderer.invoke('delete-person', fileName),
  createPersonTemplate: name => ipcRenderer.invoke('create-person-template', name),
  saveDefaultCreateTemplate: template => ipcRenderer.invoke('save-default-create-template', template),
  loadDefaultCreateTemplate: () => ipcRenderer.invoke('load-default-create-template'),
  listMarkdownCollections: () => ipcRenderer.invoke('list-markdown-collections'),
  listMarkdownFiles: collectionId => ipcRenderer.invoke('list-markdown-files', collectionId),
  loadMarkdownFile: (collectionId, fileName) =>
    ipcRenderer.invoke('load-markdown-file', collectionId, fileName),
  saveKnowledgeTemplate: (type, template) => ipcRenderer.invoke('save-knowledge-template', type, template),
  listKnowledgeTemplates: type => ipcRenderer.invoke('list-knowledge-templates', type),
  saveNeurosisTemplate: template => ipcRenderer.invoke('save-neurosis-template', template),
  listNeurosisTemplates: () => ipcRenderer.invoke('list-neurosis-templates')
})
