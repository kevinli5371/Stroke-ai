"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  getRunHistory: () => electron.ipcRenderer.invoke("get-run-history"),
  clearRunHistory: () => electron.ipcRenderer.invoke("clear-run-history"),
  getWorkflows: () => electron.ipcRenderer.invoke("get-workflows"),
  saveWorkflow: (workflow) => electron.ipcRenderer.invoke("save-workflow", workflow),
  deleteWorkflow: (id) => electron.ipcRenderer.invoke("delete-workflow", id)
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
