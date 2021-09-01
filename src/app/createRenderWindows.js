const { app, BrowserWindow } = require("electron");
const { description } = require("../../package.json");
// const appAutoUploader = require('./autoUpdate')
const initStore = require("./store");
const registerCut = require("./shortcut");
const setOtherIPC = require("./otheripc");
const setSaveFileIPC = require("./saveFile");
const temporaryFiles = require('./uploadingTemporaryFiles')
//选择路径IPC zwc  2021年8月26日16:34:22
const selectPathIPC = require("./selectPath");
const url = require("url");
const path = require("path");
const log = require("electron-log");
const setkeyBoard = require("./setkeyBoard");

const _sendMessageToRender = (win, key, data) => {
  try {
    win?.webContents?.send(key, data);
  } catch (err) {}
};
const _createWindow = (TencentIM) => {
  log.info("create window");
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
  console.log("启动主程序", mainWindow);
  mainWindow.on("ready-to-show", () => {
    log.info("ready-to-show");
    mainWindow.setTitle(description);
    mainWindow.show();

    app.setAppUserModelId(description);

    // 设置自定升级检测
    // appAutoUploader(mainWindow)

    // 设置stroe监听
    initStore();

    //设置剪切板监听
    registerCut(mainWindow);

    // 其他一些ipc
    setOtherIPC(mainWindow);
  });

  // 另存为Ipc
  setSaveFileIPC();

  //选择路径Ipc
  selectPathIPC(mainWindow);
  
  // 重设快捷键
  setkeyBoard((mainWindow) => {
    registerCut(mainWindow);
  }, mainWindow);

  //存储临时文件
  temporaryFiles(mainWindow)

  mainWindow.on("close", function (e) {
    log.info("mainWindow close");
    TencentIM.destroy();
    app.quit();
  });
  // 通知渲染进程窗口是否可见
  mainWindow.on("blur", function () {
    _sendMessageToRender(mainWindow, "mainProcessMessage", false);
  });
  mainWindow.on("focus", function () {
    _sendMessageToRender(mainWindow, "mainProcessMessage", true);
  });

  mainWindow.on("minimize", function () {
    if (process.platform !== "darwin") {
      // windows
      _sendMessageToRender(mainWindow, "mainProcessMessage", false);
    }
  });
  mainWindow.on("maximize", function () {
    if (process.platform !== "darwin") {
      // windows
      _sendMessageToRender(mainWindow, "mainProcessMessage", false);
    }
  });
  // 通知渲染进程窗口是否可见 end

  // 加载url
  const { NODE_ENV, HUARUN_ENV } = process.env;
  console.log("当前环境:", NODE_ENV);
  if (NODE_ENV === "development") {
    mainWindow.loadURL(
      `http://localhost:3000?NODE_ENV=${NODE_ENV}&HUARUN_ENV=${HUARUN_ENV}`
    );
    // 打开调试工具
    mainWindow.webContents.openDevTools();
  } else {
    // mainWindow.webContents.openDevTools(); //正式生产不需要开启
    mainWindow.loadURL(
      url.format({
        pathname: path.join(
          __dirname,
          `../../bundle/index.html?NODE_ENV=${NODE_ENV}&HUARUN_ENV=${HUARUN_ENV}`
        ),
        protocol: "file:",
        slashes: true,
      })
    );
  }
  return mainWindow;
};
const createWindow = (TIM) => {
  return _createWindow(TIM);
};

module.exports = createWindow;
