// import { BrowserWindow } from "electron";
const { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG } = require("./const/const");
const { dialog } = require('electron')
const { ipcMain, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')
const child_process = require('child_process')

class IPC {
    win = null;
    constructor(win) {
        this.win = win;
        ipcMain.on(RENDERPROCESSCALL, (event, data) => {
            // console.log("get message from render process", event.processId, data)
            const { type, params } = data;
            switch (type) {
                case MINSIZEWIN:
                    this.minsizewin();
                    break;
                case MAXSIZEWIN:
                    this.maxsizewin();
                    break;
                case CLOSE:
                    this.close();
                    break;
                case SHOWDIALOG:
                    this.showDialog();
                    break;
                case DOWNLOADFILE:
                    this.downloadFilesByUrl(params);
                    break;
                case CHECK_FILE_EXIST:
                    this.checkFileExist(params)
            }
        })

        ipcMain.on('openCallWindow', (event, data) => {
            const callWindow = new BrowserWindow({
                height: 600,
                width: 800, 
                show: true,
                webPreferences: {
                    webSecurity: true,
                    nodeIntegration: true,
                    nodeIntegrationInWorker: true,
                    enableRemoteModule: true,
                    contextIsolation: false,
                }
            });
            callWindow.removeMenu();
            callWindow.loadURL("http://localhost:3000/call.html");
            callWindow.webContents.openDevTools();
        });
    }
    minsizewin () {
        this.win.minimize()
    }
    maxsizewin () {
        this.win.maximize()
    }
    close () {
        this.win.close()
    }
    showDialog () {
        child_process.exec(`start "" ${path.resolve(process.cwd(), './download/')}`);
    }
    downloadFilesByUrl (params) {
        const { file_url, file_name } = params
        const cwd = process.cwd();
        const downloadDicPath = path.resolve(cwd, './download/')
        if (!fs.existsSync(downloadDicPath)) {
            fs.mkdirSync(downloadDicPath)
        }
        const options = {
            host: url.parse(file_url).host,
            port: 80,
            path: url.parse(file_url).pathname
        };
        if (!fs.existsSync(path.resolve(downloadDicPath, file_name))) {
            var file = fs.createWriteStream(path.resolve(downloadDicPath, file_name));
            http.get(options, (res) => {
                res.on('data', function (data) {
                    file.write(data);
                }).on('end', function () {
                    file.end();
                    console.log(file_name + ' downloaded to ' + downloadDicPath);
                });
            });
        } else {
            // 已存在
            console.log(path.resolve(downloadDicPath, file_name), '已存在，不下载')
        }
    }
    checkFileExist(path) {
        return fs.existsSync(path)
    }
}

module.exports = IPC;