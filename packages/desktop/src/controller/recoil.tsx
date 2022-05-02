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

// new convo page trigger
export const $newConvoPage = atom<boolean>({
  key: "NEW_CONVO_PAGE",
  default: false,
});

type outputMode = "audio" | "video" | "off";

// selected output mode
export const $selectedOutputMode = atom<outputMode>({
  key: "OUTPUT_MODE",
  default: "video",
});

// number of active lines
export const $numberActiveLines = atom<number>({
  key: "NUMBER_ACTIVE_LINES",
  default: 0,
});

// max number of active streams
export const $maxNumberActiveStreams = atom<number>({
  key: "MAX_NUMBER_ACTIVE_STREAMS",
  default: 0,
});
