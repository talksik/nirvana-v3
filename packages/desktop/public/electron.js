const ElectronGoogleOAuth2 =
  require("@getstation/electron-google-oauth2").default;

const path = require("path");

const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

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

app.on("ready", () => {
  console.log(process.env);
  const myApiOauth = new ElectronGoogleOAuth2(
    "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com",
    "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",
    [""],
    { successRedirectURL: "http://localhost:3000" }
  );

  myApiOauth.openAuthWindowAndGetTokens().then((token) => {
    // use your token.access_token
    console.log(`got the user's authentication: ${token}`);
  });
});
