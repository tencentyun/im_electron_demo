const {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");
const path = require("path");
const url = require("url");
const TimMain = require("im_electron_sdk/dist/main");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");
//const feedUrl = `http://oaim.crbank.com.cn:30003/_download/`
const feedUrl = `http://localhost/`;

const IPC = require("./ipc");
const child_process = require("child_process");

let ipc;
const downloadUrl = app.getPath("downloads");
new TimMain({
  sdkappid: 1400187352,
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
    },
  });

  global.WIN = mainWindow;

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();

    if (!ipc) ipc = new IPC(mainWindow);
  });

  // use for developments
  mainWindow.webContents.openDevTools();
  //mainWindow.loadURL(`http://localhost:3000`);
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../../bundle/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // 注册截图快捷键
  globalShortcut.register("CommandOrControl+Alt+C", () => {
    clipboard.clear();
    const url = downloadUrl + "\\screenShot.png";
    child_process.exec("start C:\\Users\\admin\\Desktop\\demo\\cut.exe", () => {
      let pngs = clipboard.readImage().toPNG();
      fs.writeFile(url, pngs, (err) => {
        fs.readFile(url, (err, data) => {
          mainWindow.webContents.send("screenShotUrl", { data, url });
        });
      });
    });
  });

  let sendUpdateMessage = (message, data) => {
    mainWindow.webContents.send("message", { message, data });
  };

  let checkForUpdates = () => {
    console.log(feedUrl);
    autoUpdater.setFeedURL(feedUrl);

    autoUpdater.on("error", function (message) {
      sendUpdateMessage("error", message);
    });
    autoUpdater.on("checking-for-update", function (message) {
      sendUpdateMessage("checking-for-update", message);
    });
    autoUpdater.on("update-available", function (message) {
      sendUpdateMessage("update-available", message);
    });
    autoUpdater.on("update-not-available", function (message) {
      sendUpdateMessage("update-not-available", message);
    });

    // 更新下载进度事件
    autoUpdater.on("download-progress", function (progressObj) {
      console.log(progressObj);
      sendUpdateMessage("downloadProgress", progressObj);
    });
    autoUpdater.on(
      "update-downloaded",
      function (
        event,
        releaseNotes,
        releaseName,
        releaseDate,
        updateUrl,
        quitAndUpdate
      ) {
        ipcMain.on("updateNow", (e, arg) => {
          //some code here to handle event
          autoUpdater.quitAndInstall();
        });
        sendUpdateMessage("isUpdateNow");
      }
    );

    ipcMain.on("updateNow", (e, arg) => {
      //some code here to handle event
      autoUpdater.quitAndInstall();
    });

    //执行自动更新检查
    autoUpdater.checkForUpdates();
  };
  setTimeout(checkForUpdates, 1000);

  // 接受截图事件
  ipcMain.on("SCREENSHOT", function () {
    //news 是自定义的命令 ，只要与页面发过来的命令名字统一就可以
    //接收到消息后的执行程序
    // child_process.exec(path.join(process.cwd(), '/resources/extraResources', 'cut.exe'), () => {
    //   let pngs = clipboard.readImage().toPNG()
    //   mainWindow.webContents.send('screenShotUrl', { pngs })
    // })
    // 截图存放临时地址
    const url = downloadUrl + "\\screenShot.png";
    child_process.exec("start C:\\Users\\admin\\Desktop\\demo\\cut.exe", () => {
      let pngs = clipboard.readImage().toPNG();
      fs.writeFile(url, pngs, (err) => {
        fs.readFile(url, (err, data) => {
          mainWindow.webContents.send("screenShotUrl", { data, url });
        });
      });
    });
  });
  ipcMain.on("OPENFILE", function (event, filename) {
    const name = filename.filename;
    const localUrl = path.join(process.cwd(), "/download/", name);
    console.log(
      localUrl,
      "++++++++++++++++++++++++++++++++++++++++++++==",
      downloadUrl
    );
    shell.openPath(localUrl);
  });
  // ***use for production***
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

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
