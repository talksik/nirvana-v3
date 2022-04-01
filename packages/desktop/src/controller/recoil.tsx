import { atom } from "recoil";

export const $searchQuery = atom<string>({
  key: "SEARCH_QUERY",
  default: "",
});

export const $jwtToken = atom<string>({
  key: "JWT_TOKEN",
  default: null,
});

// conversation id
export const $selectedConversation = atom<string>({
  key: "SELECTED_CONVERSATION",
  default: null,
});
