// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, Tray, nativeImage, globalShortcut, ipcRenderer, clipboard, shell, dialog } = require('electron')
//const { autoUpdater } = require('electron-updater')
const feedUrl = `http://localhost/`;
const TimMain = require('im_electron_sdk/dist/main');
const url = require('url')
const path = require('path')
const fs = require('fs')
const child_process = require('child_process');
const Store = require('electron-store');
const store = new Store()
const IPC = require("./ipc");
// 'http://oaim.crbank.com.cn:30003/emoji/notification.png'
let trayIcon = nativeImage.createFromPath(path.join(process.cwd(), '/resources/extraResources', 'notification.png'))
let forceQuit = false;
const downloadUrl = app.getPath("downloads");
let ipc
new TimMain({
  sdkappid: 1400529075
});


// 设置系统托盘
const setAppTray = () => {
  // 托盘对象
  var appTray = null
  // 系统托盘右键菜单
  var trayMenuTemplate = [
    {
      label: '退出',
      click: () => {
        if (app) {
          app.quit()
        }
      }
    }
  ]

  // 系统托盘图标目录

  // trayIcon.setTemplateImage(true)
  // trayIcon.setSize(30, 30)

  appTray = new Tray(trayIcon)

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('华润银行即时通讯')

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu)

  appTray.on('click', () => {
    console.log(appWindow, forceQuit, '==========')
    if (appWindow && !forceQuit) {
      appWindow.show()
    }
  })
  return appTray;
}
let appTray;
let appWindow;
let toggle = false;
function createWindow () {
  // Create the browser window.
  Menu.setApplicationMenu(null)
  let mainWindow = new BrowserWindow({
    height: 640,
    width: 960,
    minWidth: 830,
    minHeight: 600,
    show: false,
    frame: false,
    resizable: true,
    fullScreenable: true,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  global.WIN = mainWindow;
  mainWindow.webContents.send('SENDSTORE', store.get('sendType') || '0')

  mainWindow.once('ready-to-show', () => {
    mainWindow.setTitle("华润银行即时通讯（内测版）")
    mainWindow.show()
    if (!ipc) ipc = new IPC(mainWindow);
    // 打开调试工具
    mainWindow.webContents.openDevTools()
    app.setAppUserModelId("华润银行即时通讯（内测版）")
  })
  mainWindow.on('close', function (e) {
    if (!forceQuit && appWindow && app) {
      e.preventDefault();
      try {
        if (process.platform === 'darwin') {
          app.hide()
        } else {
          mainWindow.hide()
        }
      } catch {

      }
    }
  })
  mainWindow.on('show', function () {
    num = 0
    if (appTray) {
      appTray.setTitle("");
      hasFlash = false;
      clearInterval(timer);
      setTimeout(() => {
        appTray.setImage(trayIcon)
      }, 600)
    }
    appWindow.flashFrame(false);
  })

  mainWindow.on('blur', function () {
    console.log('mainWindow blur')
    mainWindow.webContents.send('mainProcessMessage', false)
  })
  mainWindow.on('focus', function () {
    console.log('mainWindow focus')
    mainWindow.webContents.send('SENDSTORE', store.get('sendType') || '0')
    clearInterval(timer);
    setTimeout(() => {
      appTray.setImage(trayIcon)
    }, 600)
    mainWindow.webContents.send('mainProcessMessage', true)
  })


  mainWindow.on('minimize', function () {
    if (process.platform !== 'darwin') {
      // windows
      mainWindow.webContents.send('mainProcessMessage', false)
    }
  })
  mainWindow.on('maximize', function () {
    if (process.platform !== 'darwin') {
      // windows
      mainWindow.webContents.send('mainProcessMessage', false)
    }
  })
  // mainWindow.loadURL(`http://localhost:3000`);
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../../bundle/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  let sendUpdateMessage = (message, data) => {
    mainWindow.webContents.send("message", {
      message,
      data
    });
  };
  // 自动更新升级
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
  //setTimeout(checkForUpdates, 1000)
  ipcMain.on('CHANGESTORE', function (event, data) {
    console.log(data)
    store.set('sendType', data)
  })
  // 防止同时打开多个客户端
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
    app.on('ready', () => {
      createWindow()
      const { Menu } = require('electron')
      Menu.setApplicationMenu(null) // 隐藏菜单栏
    })
  }
  // 注册截图快捷键
  globalShortcut.register("CommandOrControl+Shift+X", () => {
    // "start C:\\Users\\admin\\Desktop\\demo\\cut.exe"
    clipboard.clear();
    const url = downloadUrl + "\\screenShot.png";
    child_process.exec(path.join(process.cwd(), '/resources/extraResources', 'cut.exe'), () => {
      let pngs = clipboard.readImage().toPNG();
      fs.writeFile(url, pngs, (err) => {
        fs.readFile(url, (err, data) => {
          mainWindow.webContents.send("screenShotUrl", {
            data,
            url
          });
        });
      });
    })
  });
  // 接受截图事件
  ipcMain.on("SCREENSHOT", function () {
    //news 是自定义的命令 ，只要与页面发过来的命令名字统一就可以
    //接收到消息后的执行程序
    const url = downloadUrl + "\\screenShot.png";
    child_process.exec(path.join(process.cwd(), '/resources/extraResources', 'cut.exe'), () => {
      let pngs = clipboard.readImage().toPNG();
      fs.writeFile(url, pngs, (err) => {
        fs.readFile(url, (err, data) => {
          mainWindow.webContents.send("screenShotUrl", {
            data,
            url
          });
        });
      });
    })
  });
  // 打开文件
  ipcMain.on("OPENFILE", function (event, filename) {
    const name = filename.filename;
    const localUrl = path.join(process.cwd(), "/download/", name);
    shell.openPath(localUrl);
  });
  return mainWindow;
}

let timer;
function changeWindow () {
  if (appWindow) {
    // 设置大小
    appWindow.setSize(1000, 650)
    // 居中
    appWindow.center()
    // 允许拖拽
    appWindow.setResizable(true);
  }
}
function reSizeWindow () {
  if (appWindow) {
    // 设置大小
    appWindow.setSize(460, 358)
    // 居中
    appWindow.center()
    // 允许拖拽
    appWindow.setResizable(false);
  }
}
function trayFlash () {


  if (appTray) {
    hasFlash = true;

    timer = setInterval(() => {
      toggle = !toggle
      if (toggle) {
        appTray.setImage(nativeImage.createEmpty())
      } else {
        appTray.setImage(trayIcon)
      }
    }, 600)
  }
}

function openWindow () {
  if (appWindow) {
    appWindow.show()
  }
}
let num = 0;
let hasFlash = false;
function setTaryTitle () {
  num++;
  appTray.setTitle(num === 0 ? '' : `${num}`);
  appWindow.flashFrame(true);
  if (!hasFlash) {
    trayFlash();
  }
}
ipcMain.on('asynchronous-message', function (event, arg) {
  const [type, data] = arg.split(',');
  switch (type) {
    case 'changeWindow':
      changeWindow();
      break;
    case 'reSizeWindow':
      reSizeWindow();
      break;
    case 'openWindow':
      openWindow();
      break;
    case 'setTaryTitle':
      if (process.platform == 'darwin') {
        if (!appWindow.isVisible()) {
          setTaryTitle();
        }
      } else {
        setTaryTitle();
      }
      break;
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('before-quit', () => {
  forceQuit = true;
});
app.on('click', () => {
  if (appWindow) {
    appWindow.show();
  }
})
app.whenReady().then(() => {
  console.log(111111111111111111111111111111111111111111111111111111111)
  const template = [

  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  appTray = setAppTray();

  if (BrowserWindow.getAllWindows().length === 0) {
    appWindow = createWindow()
  }


})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


// 自定义安装目录
// "nsis": { 
//   "createDesktopShortcut": true,
//   "createStartMenuShortcut": true,
//   "oneClick": false,
//   "allowToChangeInstallationDirectory": true
// },