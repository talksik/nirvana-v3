// NOTE: DO NOT ADD ANY ELECTRON RELATED TYPESCRIPT HERE...KEEP IT ONLY TYPESCRIPT OTHERWISE
// THE RENDERER WONT BE ABLE TO ACCESS THIS AS IT WILL THINK ITS PART OF MAIN PROCESS SINCE RENDERER CAN'T ACCESS NODE STUFF
// SINCE IT's NOT A NODE PROCESS

enum Channels {
  ACTIVATE_LOG_IN = "ACTIVATE_LOG_IN",
  GOOGLE_AUTH_TOKENS = "GOOGLE_AUTH_TOKENS",
  RESIZE_WINDOW = "RESIZE_WINDOW",
  ON_WINDOW_BLUR = "ON_WINDOW_BLUR",
}

export enum STORE_ITEMS {
  AUTH_SESSION_JWT = "AUTH_SESSION_JWT",
}

export type Dimensions = { height: number; width: number };

export interface DimensionChangeRequest {
  setAlwaysOnTop: boolean;
  dimensions: Dimensions;
  addDimensions: boolean;
}

export const TERMINAL_PRESET: Dimensions = {
  height: 675,
  width: 400,
};

export const TERMINAL_DETAILS_PRESET: Dimensions = {
  height: 675,
  width: 800,
};

export const OVERLAY_ONLY_INITIAL_PRESET: Dimensions = {
  height: 50,
  width: 325,
};

export default Channels;
