const { contextBridge, ipcRenderer } = require("electron");
const { channels } = require("../src/shared/constants");

const API = {
  send: (channel, data) => {
    // whitelist channels
    // let validChannels = ["toMain"];
    // if (validChannels.includes(channel)) {
    //   ipcRenderer.send(channel, data);
    // }

    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    // let validChannels = ["fromMain"];
    // if (validChannels.includes(channel)) {
    //   // Deliberately strip event as it includes `sender`
    //   ipcRenderer.on(channel, (event, ...args) => func(...args));
    // }

    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
};

contextBridge.exposeInMainWorld("API", API);
