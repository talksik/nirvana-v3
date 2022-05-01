import {
  BrowserWindow,
  Menu,
  app,
  dialog,
  globalShortcut,
  ipcMain,
  screen,
} from "electron";
import Channels, { Dimensions } from "./electron/constants";

import { DimensionPresets } from "./electron/constants";
import { handleGoogleLogin } from "./electron/handleLogin";
import path from "path";
import store from "./electron/store";

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
export let browserWindow: BrowserWindow;

let display;

const createWindow = (): void => {
  // Create the browser window.
  browserWindow = new BrowserWindow({
    ...DimensionPresets.terminal,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: true,
    },
    icon: "./assets/1024x1024.icns",

    transparent: true,

    frame: false,
    roundedCorners: false,
  });

  browserWindow.setBackgroundColor("#00000000");

  // browserWindow.setIgnoreMouseEvents(true);
  // browserWindow.setFocusable(true);

  // and load the index.html of the app.
  browserWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  browserWindow.webContents.openDevTools({ mode: "detach" });

  display = screen.getPrimaryDisplay();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .whenReady()
  .then(createWindow)
  .then(() => {
    // activate login
    ipcMain.on(Channels.ACTIVATE_LOG_IN, async (event, arg) => {
      console.log("initiating log in");
      await handleGoogleLogin();
    });

    // access storage/cookies
    ipcMain.on("electron-store-set", async (event, key, val) => {
      store.set(key, val);
    });
    ipcMain.handle("electron-store-get", async (event, val) => {
      const result = await store.get(val);
      return result;
    });

    // dynamically changing the window bounds
    ipcMain.on(Channels.RESIZE_WINDOW, (event, arg) => {
      const { width, height } = arg;

      if (
        width === DimensionPresets.overlayOnlyMode.width &&
        height === DimensionPresets.overlayOnlyMode.height
      ) {
        browserWindow.setAlwaysOnTop(true, "floating");

        // move window/overlay to top right

        browserWindow.setPosition(display.bounds.width - width, 0, true);

        browserWindow.setSize(width, height, true);
      } else {
        browserWindow.setSize(width, height, true);

        browserWindow.center();
        browserWindow.setAlwaysOnTop(false);
      }
    });
  })
  .then(() => {
    // globalShortcut.register("`", () => {
    //   console.log("Electron loves global shortcuts!");
    // });

    // on blur, show overlay, and tell app to trigger overlay mode
    browserWindow.on("blur", () => {
      // browserWindow.setAlwaysOnTop(true, "floating");

      // let frontend handshake and then send remote control to change size
      // const overlayDimensions = DimensionPresets.overlayMode;
      // browserWindow.setSize(
      //   overlayDimensions.width,
      //   overlayDimensions.height,
      //   true
      // );

      browserWindow.webContents.send(Channels.ON_WINDOW_BLUR);
    });
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
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// open deep links from nirvana web app
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("nirvana-desktop", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("nirvana-desktop");
}

// Handle the protocol. In this case, we choose to show an Error Box.
app.on("open-url", (event, url) => {
  console.log("welcome back, you arrived from: ", url);

  browserWindow.focus();
});
