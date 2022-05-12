/* eslint-disable no-unused-vars */
import { DimensionChangeRequest, STORE_ITEMS, Channels } from './constants';

export {};
declare global {
  interface Window {
    electronAPI: {
      auth: {
        initiateLogin(): void;
      };
      store: {
        get(val: STORE_ITEMS): Promise<any>;
        set(property: STORE_ITEMS, val: any): void;
      };
      window: {
        resizeWindow(dimensionChangeRequest: DimensionChangeRequest): void;
      };
      on(channel: Channels, func: any): void;
      once(channel: Channels, func: any): void;
    };
  }
}
