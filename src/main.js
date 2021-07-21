const {
  app,
  BrowserWindow,
  ipcRenderer
} = require('electron');
const path = require('path');
const url = require('url');
const TimMain = require('im_electron_sdk/dist/main');

const IPC = require('./ipc');


let ipc;
// 私有化 sdkappid
// new TimMain({
//   sdkappid: 1400529075
// });
// 公有云 sdkappid
new TimMain({
  sdkappid: 1400187352
});

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
// declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') app.quit()
// })

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 640,
    width: 960,
    minWidth: 830,
    minHeight: 600,
    show: false,
    frame: false,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });

  global.WIN = mainWindow;

  mainWindow.on('ready-to-show', () => {
      mainWindow.show();

      if (!ipc) ipc = new IPC(mainWindow);

      // use for developments

    })

    <<
    << << < HEAD

    ===
    === =
    mainWindow.on('focus', function () {
      mainWindow.webContents.send('storagePath', {
        path: path.join(process.cwd(), '/download/')
      })
    })


    >>>
    >>> > 2e4 eb041b565cfa24dc1dd0e460173c9f9761c5e
  mainWindow.loadURL(`http://localhost:3000`);
  mainWindow.webContents.openDevTools();
  // ***use for production***

  // mainWindow.loadURL(
  //   url.format({
  //       pathname: path.join(__dirname, '../bundle/index.html'),
  //       protocol: 'file:',
  //       slashes: true
  //   })
  // );
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.