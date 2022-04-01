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

// conversation id
export const $selectedConversation = atom<string>({
  key: "SELECTED_CONVERSATION",
  default: null,
});
