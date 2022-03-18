import { electronAPI } from "./preload";

export {};
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
