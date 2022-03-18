import { contextBridge, ipcRenderer } from "electron";

import Channels from "./constants";

const electronAPI = {
  auth: {
    initiateLogin() {
      ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    },
    receiveTokens(channel: Channels, func: any) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
  },
  batteryApi: {},
  fileApi: {},
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export default electronAPI;
