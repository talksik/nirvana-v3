import Store from "electron-store";
import { ipcMain } from "electron";
const store = new Store();

export enum STORE_ITEMS {
  AUTH_TOKENS = "AUTH_TOKENS",
}

export default store;
