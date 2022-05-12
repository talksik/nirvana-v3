// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer } from 'electron';
import { Channels, Dimensions, StoreItems } from './constants';

const electronAPI = {
  auth: {
    initiateLogin() {
      ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    },
  },
  store: {
    get(val: StoreItems) {
      return ipcRenderer.invoke('electron-store-get', val);
    },
    set(property: StoreItems, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },

  window: {
    resizeWindow(newDimensions: Dimensions) {
      ipcRenderer.send(Channels.RESIZE_WINDOW, newDimensions);
    },
  },

  on(channel: Channels, func: any) {
    // const validChannels = ['ipc-example'];
    // if (validChannels.includes(channel)) {
    //   // Deliberately strip event as it includes `sender`
    //   ipcRenderer.on(channel, (event, ...args) => func(...args));
    // }

    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  once(channel: Channels, func: any) {
    // const validChannels = ["ipc-example"];
    // if (validChannels.includes(channel)) {
    //   // Deliberately strip event as it includes `sender`
    //   ipcRenderer.once(channel, (event, ...args) => func(...args));
    // }

    ipcRenderer.once(channel, (event, ...args) => func(...args));
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export default electronAPI;
