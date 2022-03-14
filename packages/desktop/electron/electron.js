const ElectronGoogleOAuth2 =
  require("@getstation/electron-google-oauth2").default;

const path = require("path");

const { app, BrowserWindow, session, ipcMain } = require("electron");
const isDev = require("electron-is-dev");

const Store = require("electron-store");
const store = new Store();

const { channels } = require("../src/shared/constants");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

const myApiOauth = new ElectronGoogleOAuth2(
  "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com",
  "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",
  [""],
  { successRedirectURL: "https://usenirvana.com" }
);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    title: "Nirvana",
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  // End of the file
  ipcMain.on(channels.ACTIVATE_LOG_IN, async (event, arg) => {
    await handleLogin();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .whenReady()
  .then(createWindow)
  .then(async () => {
    console.log(process.env);
    await handleLogin();
  });

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

async function handleLogin() {
  // read saved refresh token if any
  // todo: fix this...should be working
  const refreshToken = await store.get("refresh_token");

  // todo: remove this when I have way of getting access token from a refresh token
  if (refreshToken && false) {
    console.log("have a refresh token from user auth previously", refreshToken);
    myApiOauth.setTokens({ refresh_token: refreshToken });

    // send token to client
    win.webContents.send(channels.AUTH_TOKEN, refreshToken);
  } else {
    const token = await myApiOauth.openAuthWindowAndGetTokens();

    // store the refresh token in cookies for app reopen
    store.set("refresh_token", token.refresh_token);

    // todo: send the access token to the renderer
    // send token to client
    win.webContents.send(channels.AUTH_TOKEN, token.access_token);
  }
}
