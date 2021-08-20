
const { app, BrowserWindow } = require('electron')
const { description } = require("../../package.json");
const IPC = require("./ipc");
const appAutoUploader = require('./autoUpdate')
const initStore = require('./store')
const registerCut = require('./shortcut')
const setOtherIPC = require('./otheripc')
const setSaveFileIPC = require('./saveFile');
const url = require('url')
const path = require('path')
const log = require('electron-log');
let ipc = null;

const _sendMessageToRender = (win,key,data)=>{
    try{
        win?.webContents?.send(key,data)
    }catch(err){

    }
}
const _createWindow = (TencentIM) => {
    log.info('create window')
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
    mainWindow.on("ready-to-show", () => {
        log.info('ready-to-show')
        mainWindow.setTitle(description);
        mainWindow.show();

        // 设置ipc通信
        if (!ipc) ipc = new IPC(mainWindow);

        app.setAppUserModelId(description);

        

        // 设置自定升级检测
        // appAutoUploader(mainWindow)

        // 设置stroe监听
        initStore()

        //设置剪切板监听
        registerCut(mainWindow)

        // 其他一些ipc
        setOtherIPC(mainWindow)

        // 另存为Ipc
        setSaveFileIPC();
    });
    mainWindow.on("close", function (e) {
        log.info('mainWindow close')
        TencentIM.destroy()
        app.quit()
    });
    // 通知渲染进程窗口是否可见
    mainWindow.on("blur", function () {
        _sendMessageToRender(mainWindow,'mainProcessMessage',false)
    });
    mainWindow.on("focus", function () {
        _sendMessageToRender(mainWindow,'mainProcessMessage',true)
    });

    mainWindow.on("minimize", function () {
        if (process.platform !== "darwin") {
            // windows
            _sendMessageToRender(mainWindow,'mainProcessMessage',false)
        }
    });
    mainWindow.on("maximize", function () {
        if (process.platform !== "darwin") {
            // windows
            _sendMessageToRender(mainWindow,'mainProcessMessage',false)
        }
    })
    // 通知渲染进程窗口是否可见 end

    // 加载url
    log.info('mainWindow loadURL '+process.env?.NODE_ENV?.trim())
    if (process.env?.NODE_ENV?.trim() === 'development') {
        mainWindow.loadURL(`http://localhost:3000`);
        // 打开调试工具
        mainWindow.webContents.openDevTools();
    } else {
        // mainWindow.webContents.openDevTools(); //正式生产不需要开启
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, '../../bundle/index.html'),
                protocol: 'file:',
                slashes: true
            })
        );
    }
    return mainWindow;
}
const createWindow = (TIM) => {
    return _createWindow(TIM);
}

module.exports =  createWindow;