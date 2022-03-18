import { contextBridge, ipcRenderer } from "electron";

import Channels from "./constants";
import { STORE_ITEMS } from "./store";

const electronAPI = {
  auth: {
    initiateLogin() {
      ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    },
    receiveTokens(channel: Channels, func: any) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
  },
  store: {
    get(val: STORE_ITEMS) {
      return ipcRenderer.sendSync("electron-store-get", val);
    },
    set(property: STORE_ITEMS, val: any) {
      ipcRenderer.send("electron-store-set", property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export default electronAPI;
