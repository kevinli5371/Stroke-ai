import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  getRunHistory: () => ipcRenderer.invoke('get-run-history'),
  clearRunHistory: () => ipcRenderer.invoke('clear-run-history'),
  getWorkflows: () => ipcRenderer.invoke('get-workflows'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveWorkflow: (workflow: any) => ipcRenderer.invoke('save-workflow', workflow),
  deleteWorkflow: (id: string) => ipcRenderer.invoke('delete-workflow', id),
  planWorkflow: (command: string) => ipcRenderer.invoke('plan-workflow', command),
  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  savePreferences: (prefs: any) => ipcRenderer.invoke('save-preferences', prefs),

  // Local Model Management
  modelCheckDownloaded: () => ipcRenderer.invoke('model:check-downloaded'),
  modelDownload: () => ipcRenderer.invoke('model:download'),
  modelCancelDownload: () => ipcRenderer.invoke('model:cancel-download'),
  modelDelete: () => ipcRenderer.invoke('model:delete'),
  modelStatus: () => ipcRenderer.invoke('model:status'),
})

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  removeAllListeners(...args: Parameters<typeof ipcRenderer.removeAllListeners>) {
    const [channel, ...omit] = args
    return ipcRenderer.removeAllListeners(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})
