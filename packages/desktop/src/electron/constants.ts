// NOTE: DO NOT ADD ANY ELECTRON RELATED TYPESCRIPT HERE...KEEP IT ONLY TYPESCRIPT OTHERWISE
// THE RENDERER WONT BE ABLE TO ACCESS THIS AS IT WILL THINK ITS PART OF MAIN PROCESS SINCE RENDERER CAN'T ACCESS NODE STUFF
// SINCE IT's NOT A NODE PROCESS

enum Channels {
  ACTIVATE_LOG_IN = "ACTIVATE_LOG_IN",
  GOOGLE_AUTH_TOKENS = "GOOGLE_AUTH_TOKENS",
  RESIZE_WINDOW = "RESIZE_WINDOW",
}

export enum STORE_ITEMS {
  AUTH_SESSION_JWT = "AUTH_SESSION_JWT",
}

export type Dimensions = {
  height: number;
  width: number;
};

export const DimensionPresets = {
  terminal: {
    height: 675,
    width: 400,
  },
  terminalDetailOrOverlay: {
    height: 675,
    width: 800,
  },
  terminalDetailOverlay: {
    height: 675,
    width: 800,
  },
  // todo: typically just send whatever dimensions are needed
  overlayMode: {
    height: -1,
    width: 300,
  },
};

export default Channels;
