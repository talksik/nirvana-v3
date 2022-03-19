import { atom } from "recoil";

export const $authTokens = atom<{
  accessToken: string;
  refreshToken: string;
  idToken: string;
} | null>({
  key: "AUTH_TOKENS", // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});

export const $searchQuery = atom<string>({
  key: "SEARCH_QUERY",
  default: "",
});

export const $authFailureCount = atom<number>({
  key: "AUTH_FAILURE_COUNT",
  default: 0,
});
