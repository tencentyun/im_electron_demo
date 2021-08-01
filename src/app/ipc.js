// import { BrowserWindow } from "electron";
const { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG, OPEN_CALL_WINDOW, CALL_WINDOW_CLOSE_REPLY } = require("./const/const");
const { dialog } = require('electron')
const { ipcMain, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')
const http = require('http')
const fetch = require("node-fetch");
const url = require('url')
const child_process = require('child_process')
class IPC {
    win = null;
    callWindow = null;
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
        });
    }
    createNewWindow () {
        const env = process.env?.NODE_ENV?.trim();
        const isDev = env === 'development';
        const callWindow = new BrowserWindow({
            height: 600,
            width: 800,
            show: false,
            frame: false,
            webPreferences: {
                parent: this.win,
                webSecurity: true,
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                enableRemoteModule: true,
                contextIsolation: false,
            },
        });
        callWindow.removeMenu();
        if (isDev) {
            callWindow.loadURL("http://localhost:3000/call.html");
            callWindow.webContents.openDevTools();
        } else {
            callWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, '../../bundle/call.html'),
                    protocol: 'file:',
                    slashes: true
                })
            );
        }

        callWindow.on('ready-to-show', () => {
            callWindow.show();
        });

        return callWindow;
    }
    minsizewin () {
        this.win.minimize()
    }
    maxsizewin () {
        console.log(this.win.isMaximized(), '++++++++++++++++++++++++++++++++++')
        this.win.isMaximized() ? this.win.unmaximize() : this.win.maximize()
    }
    close () {
        this.win.hide()
    }
    showDialog () {
        child_process.exec(`start "" ${path.resolve(process.cwd(), './download/')}`);
    }
    // downloadFilesByUrl (params) {
    //     const { file_url, file_name } = params
    //     console.log(params)
    //     const cwd = process.cwd();
    //     const downloadDicPath = path.resolve(cwd, './download/')

    //     if (!fs.existsSync(downloadDicPath)) {
    //         fs.mkdirSync(downloadDicPath)
    //     }
    //     const options = {
    //         host: url.parse(file_url).host,
    //         port: url.parse(file_url).port,
    //         path: url.parse(file_url).pathname
    //     };
    //     if (!fs.existsSync(path.resolve(downloadDicPath, file_name))) {
    //         var file = fs.createWriteStream(path.resolve(downloadDicPath, file_name));
    //         http.get(options, (res) => {
    //             res.on('data', function (data) {
    //                 file.write(data);
    //             }).on('end', function () {
    //                 file.end();
    //                 console.log(file_name + ' downloaded to ' + downloadDicPath);
    //             });
    //         });
    //     } else {
    //         // 已存在
    //         console.log(path.resolve(downloadDicPath, file_name), '已存在，不下载')
    //     }
    // }
    downloadFilesByUrl (file) {
        console.log('111222333', file)
        const cwd = process.cwd();
        let file_url = file.file_url
        const downloadDicPath = path.resolve(cwd, './download/')
        if (!fs.existsSync(downloadDicPath)) {
            fs.mkdirSync(downloadDicPath)
        }

        const file_name = path.basename(file.file_name)
        const file_path = path.resolve(downloadDicPath, file_name)
        const file_path_temp = `${file_path}`

        if (!fs.existsSync(file_path)) {

            //创建写入流
            const fileStream = fs.createWriteStream(file_path_temp).on('error', function (e) {
                console.error('error==>', e)
            }).on('ready', function () {
                console.log("开始下载:", file_url);
            }).on('finish', function () {
                //下载完成后重命名文件
                fs.renameSync(file_path_temp, file_path);
                console.log('文件下载完成:', file_path);
            });
            //请求文件
            fetch(file_url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/octet-stream' },
            }).then(res => {
                //获取请求头中的文件大小数据
                let fsize = res.headers.get("content-length");
                //创建进度
                let str = progressStream({
                    length: fsize,
                    time: 100 /* ms */
                });
                // 下载进度 
                str.on('progress', function (progressData) {
                    //不换行输出
                    let percentage = Math.round(progressData.percentage) + '%';
                    console.log(percentage, '下载进度');
                });
                res.body.pipe(str).pipe(fileStream);
            }).catch(e => {
                //自定义异常处理
                console.log(e);
            });
        } else {
            // 已存在
            console.log(path.resolve(downloadDicPath, file_name), '已存在，不下载')
        }
    }
    checkFileExist (path) {
        return fs.existsSync(path)
    }
}

module.exports = IPC;


