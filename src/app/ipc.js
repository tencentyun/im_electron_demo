const { CLOSE, SDK_APP_ID, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG, OPEN_CALL_WINDOW, CLOSE_CALL_WINDOW,END_CALL_WINDOW, CALL_WINDOW_CLOSE_REPLY, GET_VIDEO_INFO, SELECT_FILES, DOWNLOAD_PATH, GET_FILE_INFO_CALLBACK, SUPPORT_IMAGE_TYPE } = require("./const/const");
const { ipcMain, BrowserWindow, dialog } = require('electron')
const { screen } = require('electron')
const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')
const fetch = require("node-fetch");
const progressStream = require('progress-stream');
const child_process = require('child_process')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require("fluent-ffmpeg")
const sizeOf = require('image-size')
const FileType = require('file-type')
const ffprobe = require('ffprobe-static');

const getSrceenSize = () => {
    const display = screen.getPrimaryDisplay();

    return display.size;
}

const setPath = isDev => {
    const ffprobePath = isDev ? ffprobe.path : ffprobe.path.replace('app.asar', 'app.asar.unpacked');
    const formateFfmpegPath = isDev ? ffmpegPath : ffmpegPath.replace('app.asar', 'app.asar.unpacked');
    FFmpeg.setFfprobePath(ffprobePath);
    FFmpeg.setFfmpegPath(formateFfmpegPath);
}

class IPC {
    win = null;
    callWindow = null; // 通话窗口
    imWindowEvent = null; // 聊天窗口
    constructor(win){
        const env = process.env?.NODE_ENV?.trim();
        const isDev = env === 'development';
        setPath(isDev);
        this.win = win;
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
        this.eventListiner(isDev);
    }

    eventListiner (isDev) {
        const screenSize = getSrceenSize();
        // 当作为接收方，接受电话后，更改窗口尺寸。
        ipcMain.on('accept-call', (event, acceptParams) => {
            // 向聊天窗口通信
            const { inviteID, isVoiceCall } = acceptParams;
            this.imWindowEvent.reply('accept-call-reply',inviteID);
            const windowWidth = isVoiceCall ? 450 : 800;
            const windowHeight = isVoiceCall ? 800 : 600;

            const positionX = Math.floor((screenSize.width - windowWidth) / 2);
            const positionY = Math.floor((screenSize.height - windowHeight) / 2);

            this.callWindow.setSize(windowWidth, windowHeight);
            this.callWindow.setPosition(positionX, positionY);
        });

        // 当作为接收方，挂断电话，关闭窗口
        ipcMain.on('refuse-call', (event,inviteID) => {
            this.callWindow.close();
            // 向聊天窗口通信
            this.imWindowEvent.reply('refuse-call-reply',inviteID);
        });

        // 当接受方拒绝通话后，调用该方法可关闭窗口，并退出房间
        ipcMain.on(CLOSE_CALL_WINDOW, () => {
            this.callWindow.webContents.send('exit-room');
        });
        ipcMain.on(END_CALL_WINDOW,()=>{
            this.callWindow.close()
        })
        // 远端用户进入
        ipcMain.on('remote-user-join', (event, userId) => {
            this.imWindowEvent.reply('remote-user-join-reply', userId)
        });

        // 远端用户离开
        ipcMain.on('remote-user-exit', (event, userId) => {
            this.imWindowEvent.reply('remote-user-exit-reply', userId)
        });

        // 取消通话邀请
        ipcMain.on('cancel-call-invite', (event, inviteID) => {
            this.imWindowEvent.reply('cancel-call-invite-reply', inviteID);
        });

        // 更新邀请列表(当用户拒绝邀请后，需通知通话窗口)
        ipcMain.on('update-invite-list', (event, inviteList) => {
            this.callWindow.webContents.send('update-invite-list', inviteList);
        });

        ipcMain.on(OPEN_CALL_WINDOW, (event, data) => {
            this.imWindowEvent = event;
            const addSdkAppid = {
                ...data,
                sdkAppid: SDK_APP_ID
            }
            const params = JSON.stringify(addSdkAppid);
            const { convInfo: { convType }, callType } = data;
            if(data.windowType === 'notificationWindow') {
                this.callWindow.setSize(320, 150);
                this.callWindow.setPosition(screenSize.width - 340, screenSize.height - 200);
            } else if( convType === 1 && Number(callType) === 1) {
                this.callWindow.setSize(450, 800);
                this.callWindow.setPosition(Math.floor((screenSize.width - 450) / 2), Math.floor((screenSize.height - 800) / 2));
            }
            this.callWindow.show();
            this.callWindow.webContents.send('pass-call-data', params);
            isDev && this.callWindow.webContents.openDevTools();

            this.callWindow.on('close', () => {
                event.reply(CALL_WINDOW_CLOSE_REPLY);
                this.createNewWindow(isDev);
            })
        })
    }

    createNewWindow (isDev) {
        const callWindow = new BrowserWindow({
            height: 600,
            width: 800,
            show: false,
            frame: false,
            resizable:false,
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
    minsizewin () {
        this.win.minimize()
    }
    maxsizewin () {
        this.win.isMaximized() ? this.win.unmaximize() : this.win.maximize()
    }
    close () {
        this.win.close()
    }
    showDialog () {
        child_process.exec(`start "" ${path.resolve(process.cwd(), './download/')}`);
    }
    downloadFilesByUrl (file_url) {
        const cwd = process.cwd();
        const downloadDicPath = path.resolve(cwd, './download/')
        if (!fs.existsSync(downloadDicPath)) {
            fs.mkdirSync(downloadDicPath)
        }
        console.log(22333)
        console.log(file_url)
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
            });

        } else {
            // 已存在
            console.log(path.resolve(downloadDicPath, file_name), '已存在，不下载')
        }
    }
    async _getVideoInfo (event, filePath) {
        let videoDuration, videoSize
        const screenshotName = path.basename(filePath).split('.').shift() + '.png'
        const screenshotPath = path.resolve(DOWNLOAD_PATH, screenshotName)

        const { ext } = await FileType.fromFile(filePath)

        return new Promise((resolve, reject) => {
            try {
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
                        event.reply('main-process-error', err);
                        reject(err)
                    })
                    .screenshots({
                        timestamps: [0],
                        filename: screenshotName,
                        folder: DOWNLOAD_PATH
                    }).ffprobe((err, metadata) => {
                        if (!err) {
                            videoDuration = metadata.format.duration
                            videoSize = metadata.format.size
                        } else {
                            event.reply('main-process-error', err);
                            console.log(err)
                        }
                    })
            } catch (err) {
                event.reply('main-process-error', err);
                console.log(err)
            }
        })
    }
    async _getImageInfo (path) {
        const { width, height, type } = await sizeOf(path)
        const { size } = fs.statSync(path)
        return {
            width, height, type, size
        }
    }

    async getVideoInfo (event, params) {
        const { path } = params;
        const data = await this._getVideoInfo(event, path)
        event.reply(GET_FILE_INFO_CALLBACK, { triggerType: GET_VIDEO_INFO, data })
    }

    async selectFiles (event, params) {
        const { extensions, fileType, multiSelections } = params
        const [filePath] = dialog.showOpenDialogSync(this.win, {
            properties: ['openFile'],
            filters: [{
                name: "Images", extensions: extensions
            }]
        })
        const size = fs.statSync(filePath).size;
        const name = path.parse(filePath).base;
        const type = name.split('.')[1];

        const data = {
            path: filePath,
            size,
            name,
            type
        };
        console.log(data)
        console.log(11223344)
        if (SUPPORT_IMAGE_TYPE.find(v => type.includes(v))) {
            const fileContent = await fs.readFileSync(filePath);
            data.fileContent = fileContent;
            console.log(data)
        }



        event.reply(GET_FILE_INFO_CALLBACK, {
            triggerType: SELECT_FILES,
            data
        })
    }
}

module.exports = IPC;