"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  getRunHistory: () => electron.ipcRenderer.invoke("get-run-history"),
  clearRunHistory: () => electron.ipcRenderer.invoke("clear-run-history"),
  getWorkflows: () => electron.ipcRenderer.invoke("get-workflows"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveWorkflow: (workflow) => electron.ipcRenderer.invoke("save-workflow", workflow),
  deleteWorkflow: (id) => electron.ipcRenderer.invoke("delete-workflow", id),
  planWorkflow: (command) => electron.ipcRenderer.invoke("plan-workflow", command),
  getPreferences: () => electron.ipcRenderer.invoke("get-preferences"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  savePreferences: (prefs) => electron.ipcRenderer.invoke("save-preferences", prefs),
  // Local Model Management
  modelCheckDownloaded: () => electron.ipcRenderer.invoke("model:check-downloaded"),
  modelDownload: () => electron.ipcRenderer.invoke("model:download"),
  modelCancelDownload: () => electron.ipcRenderer.invoke("model:cancel-download"),
  modelDelete: () => electron.ipcRenderer.invoke("model:delete"),
  modelStatus: () => electron.ipcRenderer.invoke("model:status")
});
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  removeAllListeners(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.removeAllListeners(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
