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
  store: {
    get(val: string) {
      return ipcRenderer.sendSync("electron-store-get", val);
    },
    set(property: string, val: any) {
      ipcRenderer.send("electron-store-set", property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export default electronAPI;
