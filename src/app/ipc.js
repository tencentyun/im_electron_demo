// import { BrowserWindow } from "electron";
const { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG, OPEN_CALL_WINDOW, CALL_WINDOW_CLOSE_REPLY, GET_VIDEO_INFO, GET_VIDEO_INFO_CALLBACK, SELECT_FILES, SELECT_FILES_CALLBACK, DOWNLOAD_PATH } = require("./const/const");
const { ipcMain, BrowserWindow, dialog } = require('electron')
const { screen } = require('electron')
const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')
const fetch = require("node-fetch");
const progressStream = require('progress-stream');
const child_process = require('child_process')
const shelljs = require("shelljs")
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require("fluent-ffmpeg")
const ffprobeStatic = require('ffprobe-static');
const sizeOf = require('image-size')
const FileType = require('file-type')
const ffprobe = require('ffprobe-static');
FFmpeg.setFfprobePath(ffprobe.path);
FFmpeg.setFfmpegPath(ffmpegPath);
const getSrceenSize = () => {
    const display = screen.getPrimaryDisplay();

    return display.size;
}

class IPC {
    win = null;
    callWindow = null;
    constructor(win){
        const env = process.env?.NODE_ENV?.trim();
        const isDev = env === 'development';
        const screenSize = getSrceenSize();
        this.win = win;
        this.initFFmpeg();
        ipcMain.on(RENDERPROCESSCALL, (event, data) => {
            console.log("get message from render process", event.processId, data)
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
                case GET_VIDEO_INFO:
                    this.getVideoInfo(event, params);
                    break;
                case SELECT_FILES:
                    this.selectFiles(event, params);
                    break;
            }
        });


        this.createNewWindow(isDev);

        ipcMain.on('accept-call', () => {
            this.callWindow.setSize(800, 600);
            this.callWindow.setPosition(screenSize.width / 2 - 400, screenSize.height /  2 - 300);
        });

        ipcMain.on('refuse-call', () => {
            this.callWindow.close();
        });

        ipcMain.on(OPEN_CALL_WINDOW, (event, data) => {
            const params = JSON.stringify(data);
            if(data.windowType === 'notificationWindow') {
                this.callWindow.setSize(320, 150);
                this.callWindow.setPosition(screenSize.width - 340, screenSize.height - 200);
            }
            this.callWindow.show();
            this.callWindow.webContents.send('pass-call-data', params);
            isDev && this.callWindow.webContents.openDevTools();

            this.callWindow.on('close', () => {
                event.reply(CALL_WINDOW_CLOSE_REPLY);
                this.createNewWindow(isDev);
            });
        });
    }
    createNewWindow(isDev) {
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
        if(isDev) {
            callWindow.loadURL(`http://localhost:3000/call.html`);
        } else {
            callWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, `../../bundle/call.html`),
                    protocol: 'file:',
                    slashes: true
                })
            );
        }

        this.callWindow = callWindow;
    }
    initFFmpeg() {
        // add ffmpeg to path
        const command = `export PATH="$PATH:${ffprobeStatic.path}"`
        // compatable with electron env
        // issue: https://github.com/shelljs/shelljs/wiki/Electron-compatibility
        shelljs.config.execPath = shelljs.which('node').toString()
        shelljs.exec(command)
    }
    minsizewin() {
        this.win.minimize()
    }
    maxsizewin() {
        this.win.maximize()
    }
    close() {
        this.win.close()
    }
    showDialog() {
        child_process.exec(`start "" ${path.resolve(process.cwd(), './download/')}`);
    }
    downloadFilesByUrl(file_url) {
        const cwd = process.cwd();
        const downloadDicPath = path.resolve(cwd, './download/')
        if (!fs.existsSync(downloadDicPath)) {
            fs.mkdirSync(downloadDicPath)
        }
        
        const file_name = url.parse(file_url).pathname.split('/').pop()
        const file_path = path.resolve(downloadDicPath, file_name)
        const file_path_temp =  `${file_path}.tmp`
        
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
                    console.log(percentage);
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
    async _getVideoInfo(filePath) {
        let videoDuration, videoSize
        const screenshotName = path.basename(filePath).split('.').shift()+'.png'
        const screenshotPath = path.resolve(DOWNLOAD_PATH, screenshotName)

        const { ext } = await FileType.fromFile(filePath)
        
        return new Promise((resolve, reject) => {
            try{
                FFmpeg(filePath)
                .on('end', async (err, info) => {
                    const { width, height, type, size } = await this._getImageInfo(screenshotPath)
                    resolve({
                        videoDuration,
                        videoPath: filePath,
                        videoSize,
                        videoType: ext,
                        screenshotPath,
                        screenshotWidth: width,
                        screenshotHeight: height,
                        screenshotType: type,
                        screenshotSize: size,
                    })
                })
                .on('error', (err, info) => {
                    reject(err)
                })
                .screenshots({
                    timestamps: [0],
                    filename: screenshotName,
                    folder: DOWNLOAD_PATH
                }).ffprobe((err, metadata) => {
                   if(!err){
                    videoDuration = metadata.format.duration
                    videoSize = metadata.format.size
                   }else{
                       console.log(err)
                   }
                })
            }catch(err){
                console.log(err)
            }
        })
    }
    async _getImageInfo(path) {
        const { width, height, type } = await sizeOf(path)
        const { size } = fs.statSync(path)
        return {
            width, height, type, size
        }
    }
    async getVideoInfo(event, params) {
        const { path } = params;
        const data = await this._getVideoInfo(path)
        event.reply(GET_VIDEO_INFO_CALLBACK, data) 
    }
    async selectFiles(event, params) {
        const { extensions, fileType, multiSelections } = params
        const [filePath] = dialog.showOpenDialogSync(this.win, {
            properties: ['openFile'],
            filters: [{
                name: "Images", extensions: extensions
            }]
        })
        let data
        switch(fileType) {
            case "file":
                data = {
                    filePath: filePath,
                    fileSize: fs.statSync(filePath).size,
                    fileName: path.parse(filePath).base
                }
                break;
            case "image":
                data = {
                    imagePath: filePath
                }
                break;
            case "video":
                data = await this._getVideoInfo(filePath)
                break;
            case "sound":
                data = {
                    soundPath: filePath
                }
                break;
        }
        event.reply(SELECT_FILES_CALLBACK, {
            fileType,
            data
        })   
    }
}

module.exports = IPC;