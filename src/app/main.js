// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
} = require("electron");
const TimMain = require("im_electron_sdk/dist/main");


const { SDK_APP_ID } = require('./const/const');
const createWindow = require('./createRenderWindows')
const setAppTray = require('./traySetting')
const TencentIM = new TimMain({
  // sdkappid: 1400529075
  sdkappid: SDK_APP_ID
});
global.sharedObject = {
  appWindow: null,
  appTray:null
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



  
  app.whenReady().then(() => {

    global.sharedObject.appWindow = createWindow()
    appTray.sharedObject.appTray = setAppTray(global.sharedObject.appWindow)

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        global.sharedObject.appWindow = createWindow()
      }
    })
  })
  app.on("before-quit", () => {
    TencentIM.destroy()
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


}