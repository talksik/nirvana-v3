import { API } from "./preload";
export {};
declare global {
  interface Window {
    API: typeof API;
  }
}
