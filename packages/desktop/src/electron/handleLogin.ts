import Channels, { STORE_ITEMS } from "./constants";

import ElectronGoogleOAuth2 from "@getstation/electron-google-oauth2";
import { browserWindow } from "../index";
import { ipcMain } from "electron";
import store from "./store";

const myApiOauth = new ElectronGoogleOAuth2(
  "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com",
  "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",
  [""],
  { successRedirectURL: "https://usenirvana.com" }
);

// FRESH LOGIN...either tokens of user expired or never had them
export async function handleLogin() {
  // read saved refresh token if any
  // todo: fix this...should be working
  const authTokens = await store.get(STORE_ITEMS.AUTH_TOKENS);

  // todo: remove this when I have way of getting access token from a refresh token
  // if (refreshToken) {
  //   console.log("have a refresh token from user auth previously", refreshToken);
  //   // myApiOauth.setTokens({ refresh_token: refreshToken });

  //   // send token to client
  //   browserWindow.webContents.send(Channels.AUTH_TOKENS, refreshToken);
  // } else {
  //   const token = await myApiOauth.openAuthWindowAndGetTokens();

  //   // store the refresh token in cookies for app reopen
  //   store.set("tokens", token);

  //   // todo: send the access token to the renderer
  //   // send token to client
  //   browserWindow.webContents.send(Channels.AUTH_TOKENS, token);
  // }

  const tokens = await myApiOauth.openAuthWindowAndGetTokens();

  store.set(STORE_ITEMS.AUTH_TOKENS, tokens);

  browserWindow.webContents.send(Channels.AUTH_TOKENS, tokens);
}
