const { contextBridge, ipcRenderer } = require("electron");
const { channels } = require("../src/shared/constants");

const API = {
  activateLogin: () => ipcRenderer.send(channels.ACTIVATE_LOG_IN),
};

contextBridge.exposeInMainWorld("API", API);
