// NOTE: DO NOT ADD ANY ELECTRON RELATED TYPESCRIPT HERE...KEEP IT ONLY TYPESCRIPT OTHERWISE
// THE RENDERED WONT BE ABLE TO ACCESS THIS AS IT WILL THINK ITS PART OF MAIN PROCESS

enum Channels {
  ACTIVATE_LOG_IN = "ACTIVATE_LOG_IN",
  AUTH_TOKENS = "AUTH_TOKENS",
  RESIZE_WINDOW = "RESIZE_WINDOW",
}

export enum STORE_ITEMS {
  AUTH_TOKENS = "AUTH_TOKENS",
}

export const Dimensions = {
  default: {
    height: 700,
    width: 500,
  },
  selectedConvo: {
    height: 700,
    width: 900,
  },
};

export default Channels;
