import { contextBridge, ipcRenderer } from "electron";

import Channels from "./constants";

const electronAPI = {
  auth: {
    initiateLogin() {
      ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    },
    receiveTokens(callback: any) {
      ipcRenderer.on(Channels.AUTH_TOKENS, callback);
    },
  },
  batteryApi: {},
  fileApi: {},
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export default electronAPI;
