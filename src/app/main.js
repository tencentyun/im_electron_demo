// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  crashReporter
} = require("electron");
const TimMain = require("im_electron_sdk/dist/main");
const { SDK_APP_ID } = require('./const/const');
const createWindow = require('./createRenderWindows')
const setAppTray = require('./traySetting')
const { productName,version,author } = require('../../package.json')
const IPC = require('./ipc');
const CallWindowIpc = require('./callWindowIpc');

const log = require('electron-log');

let ipc = null;
let callWindowIpc = null;
crashReporter.start({
  productName: `${productName}_${version}`,
  companyName: author.name,
  uploadToServer: false
});

const TencentIM = new TimMain({
  // sdkappid: 1400529075
  sdkappid: SDK_APP_ID
});


global.sharedObject = {
  appWindow: null,
  appTray:null
}



const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log.info('当前已有应用运行中，直接退出')
  // 已经有运行中的实例
  app.quit()
} else {
  app.on('second-instance', () => {
    log.info('second-instance emit')
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
    log.info('app ready')
    log.info('崩溃日志目录:'+app.getPath('crashDumps'))
    global.sharedObject.appWindow = createWindow(TencentIM)
    global.sharedObject.appTray = setAppTray(global.sharedObject.appWindow)

    // 设置ipc通信
    if (!ipc) ipc = new IPC(global.sharedObject.appWindow);
    if (!callWindowIpc) callWindowIpc =  new CallWindowIpc();


    app.on('activate', function () {
      log.info('app activate')
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        global.sharedObject.appWindow = createWindow(TencentIM)
      }
    })
  })
  app.on("before-quit", () => {
    log.info('before-quit')
    TencentIM.destroy()
  });

  app.on("click", () => {
    const { appWindow } = global.sharedObject
    if (appWindow) {
      appWindow.show();
    }
  });

  app.on('window-all-closed', () => {
    log.info('window-all-closed')
    if (process.platform !== "darwin") app.exit();
  });


}