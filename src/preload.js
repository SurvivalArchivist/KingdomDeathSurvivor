const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  selectDataSourceFolder: sourceKey => ipcRenderer.invoke('select-data-source-folder', sourceKey),
  getSavedDataSources: () => ipcRenderer.invoke('get-saved-data-sources'),
  listPeople: () => ipcRenderer.invoke('list-people'),
  loadPerson: fileName => ipcRenderer.invoke('load-person', fileName),
  savePerson: (person, options) => ipcRenderer.invoke('save-person', person, options),
  deletePerson: fileName => ipcRenderer.invoke('delete-person', fileName),
  createPersonTemplate: name => ipcRenderer.invoke('create-person-template', name),
  listMarkdownCollections: () => ipcRenderer.invoke('list-markdown-collections'),
  listMarkdownFiles: collectionId => ipcRenderer.invoke('list-markdown-files', collectionId),
  loadMarkdownFile: (collectionId, fileName) =>
    ipcRenderer.invoke('load-markdown-file', collectionId, fileName),
  saveKnowledgeTemplate: (type, template) => ipcRenderer.invoke('save-knowledge-template', type, template),
  listKnowledgeTemplates: type => ipcRenderer.invoke('list-knowledge-templates', type),
  saveNeurosisTemplate: template => ipcRenderer.invoke('save-neurosis-template', template),
  listNeurosisTemplates: () => ipcRenderer.invoke('list-neurosis-templates')
})
