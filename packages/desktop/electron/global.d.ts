import { API } from "./preload";
export {};
declare global {
  interface Window {
    electron: typeof API;
  }
}
