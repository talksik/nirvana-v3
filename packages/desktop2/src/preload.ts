import { contextBridge, ipcRenderer } from "electron";

const API = {
  notificationApi: {
    sendNotification() {
      ipcRenderer.send("notify", "message");
    },
  },
  batteryApi: {},
  fileApi: {},
};

contextBridge.exposeInMainWorld("electron", API);

export default API;
