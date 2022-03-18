import { atom } from "recoil";

export const $authTokens = atom<{
  accessToken: string;
  refreshToken: string;
  idToken: string;
}>({
  key: "AUTH_TOKENS", // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});
