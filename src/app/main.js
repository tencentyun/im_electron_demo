// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
} = require("electron");
const TimMain = require("im_electron_sdk/dist/main");


const { SDK_APP_ID } = require('./const/const');
const createWindow = require('./createRenderWindows')
const setAppTray = require('./traySetting')
new TimMain({
  // sdkappid: 1400529075
  sdkappid: SDK_APP_ID
});
global.sharedObject = {
  appWindow: null
}

// let timer;

// function trayFlash() {
//   if (appTray) {
//     hasFlash = true;

//     timer = setInterval(() => {
//       toggle = !toggle;
//       if (toggle) {
//         appTray.setImage(nativeImage.createEmpty());
//       } else {
//         appTray.setImage(trayIcon);
//       }
//     }, 600);
//   }
// }

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 已经有运行中的实例
  app.quit()
} else {
  app.on('second-instance', () => {
    const { appWindow } = global.sharedObject
    if (appWindow) {
      appWindow.show()
      if (appWindow.isMinimized()) {
        appWindow.restore()
      }
      appWindow.focus()
    }
  })



  app.on('ready', () => {
    global.sharedObject.appWindow = createWindow()
    setAppTray(global.sharedObject.appWindow)
  });

  app.on("before-quit", () => {
    forceQuit = true;
  });

  app.on("click", () => {
    const { appWindow } = global.sharedObject
    if (appWindow) {
      appWindow.show();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      global.sharedObject.appWindow = createWindow()
    }
  });

}