// import { BrowserWindow } from "electron";
const { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG } = require("./const/const");
const { dialog, clipboard, globalShortcut } = require('electron')
const { ipcMain } = require('electron')
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
            }
        })
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
    downloadFilesByUrl ({ url, name }) {
        console.log(url, '1111111111111111111', name)
        const cwd = process.cwd();
        const downloadDicPath = path.resolve(cwd, './download/')
        if (!fs.existsSync(downloadDicPath)) {
            fs.mkdirSync(downloadDicPath)
        }

        const urlArr = url.split("/");
        const options = {
            // host: url.parse(url).host,
            // port: 80,
            // path: url.parse(url).pathname
            host: urlArr[2],
            port: 80,
            path: urlArr[3]
        };
        console.log(options, 'options')
        if (!fs.existsSync(path.resolve(downloadDicPath, name))) {
            var file = fs.createWriteStream(path.resolve(downloadDicPath, name));
            http.get(options, (res) => {
                res.on('data', function (data) {
                    file.write(data);
                }).on('end', function () {
                    file.end();
                });
            });
        } else {
            // 已存在
            console.log(path.resolve(downloadDicPath, name), '已存在，不下载')
        }
    }
}

module.exports = IPC;