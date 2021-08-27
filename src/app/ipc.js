const { CLOSE, SDK_APP_ID,HIDE, DOWNLOADFILE, MAXSIZEWIN, SETTING_FILES_ITEM, MINSIZEWIN, CHECK_FILE_EXIST, RENDERPROCESSCALL, SHOWDIALOG, OPEN_CALL_WINDOW, CLOSE_CALL_WINDOW, END_CALL_WINDOW, CALL_WINDOW_CLOSE_REPLY, GET_VIDEO_INFO, SELECT_FILES, DOWNLOAD_PATH, GET_FILE_INFO_CALLBACK, SUPPORT_IMAGE_TYPE,SCREEN_KEY } = require("./const/const");
const { ipcMain, BrowserWindow, dialog,screen,app, ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')
const fetch = require("node-fetch");
const progressStream = require('progress-stream');
const child_process = require('child_process')
const FFmpeg = require("fluent-ffmpeg")
const sizeOf = require('image-size')
const FileType = require('file-type')
const os = require('os')
const log = require('electron-log')
const Store = require("electron-store");
const store = new Store();


const setPath = () => {
    const ffprobePath = app.isPackaged ? path.resolve(process.resourcesPath, `extraResources/${os.platform()}/${os.arch()}/ffprobe`) : path.resolve(process.cwd(), `extraResources/${os.platform()}/${os.arch()}/ffprobe`)
    const formateFfmpegPath = app.isPackaged ? path.resolve(process.resourcesPath, `extraResources/${os.platform()}-${os.arch()}/ffmpeg`) : path.resolve(process.cwd(), `extraResources/${os.platform()}-${os.arch()}/ffmpeg`)
    log.info(`ffprobePath: ${ffprobePath}`)
    log.info(`formateFfmpegPath: ${formateFfmpegPath}`)
    FFmpeg.setFfprobePath(ffprobePath);
    FFmpeg.setFfmpegPath(formateFfmpegPath);
}

let  DOWNLOAD_PATH_T = DOWNLOAD_PATH

class IPC {
    win = null;
    constructor(win) {
        setPath();
        this.mkDownloadDic(); //创建download 文件目录
        this.settingModle(); //设置快捷键 zwc  2021年8月26日18:08:35
        this.win = win;
        ipcMain.handle(RENDERPROCESSCALL, async (event, data) => {
            const { type, params } = data;
            console.log("get message from render process", event.processId, data)
            switch (type) {
                case CHECK_FILE_EXIST:
                    return await this.checkFileExist(params);
            }

        })
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
                case HIDE:
                    this.hide();
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


    }
    async checkFileExist(path) {
        return new Promise((resolve) => {
            fs.access(path, (err => {
                if (err) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            }))
        })
    }

    settingModle(){
        console.log("检测是否有配置文件:")
        let settingModle = DOWNLOAD_PATH_T
        let screenModle= SCREEN_KEY;
            try {
                fs.accessSync(SETTING_FILES_ITEM + "/setting.txt")
                    const fileData =  fs.readFileSync(SETTING_FILES_ITEM + "/setting.txt",'utf-8')
                    const fileDataJson = JSON.parse(fileData)
                    !!fileDataJson.selectpath && (settingModle = fileDataJson.selectpath + '\\')
                    !!fileDataJson.screenshot && (screenModle = fileDataJson.screenshot)
            } catch (error) {
                
            }
            store.set('setting', settingModle)
            store.set('settingScreen', screenModle)
            return settingModle
    }
    
    minsizewin() {
        this.win.minimize()
    }
    hide(){
        this.win.hide()
    }
    maxsizewin() {
        this.win.isMaximized() ? this.win.unmaximize() : this.win.maximize()
    }
    close() {
        this.win.close()
    }
    showDialog() {
        child_process.exec(`start "" ${this.settingModle()}`);
    }
    mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }
    mkDownloadDic() {
        this.mkdirsSync(this.settingModle())
    }
    
    downloadFilesByUrl({ url: file_url, name, fileid }) {
        try {
            const downloadDicPath = this.settingModle()
            let file_name
            let file_path
            let file_path_temp
            try {
                file_name = name
                file_path = path.resolve(downloadDicPath, file_name)
                file_path_temp = `${file_path}.tmp`
            } catch (err) {

            }
            if (!file_name || !file_path || !file_path_temp) {
                return
            }
            if (!fs.existsSync(file_path)) {

                //创建写入流
                const fileStream = fs.createWriteStream(file_path_temp).on('error', function (e) {
                    console.error('error==>', e)
                }).on('ready', function () {
                    console.log("开始下载:", file_url);
                }).on('finish', function () {
                    try {
                        //下载完成后重命名文件
                        fs.renameSync(file_path_temp, file_path);
                        console.log('文件下载完成:', file_path);
                        this.imWindowEvent.reply('download_reset_view', true)
                    } catch (err) {

                    }
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
                    str.on('progress', (progressData) => {
                        //不换行输出
                        let percentage = Math.round(progressData.percentage) + '%';
                        if (fileid) {
                            try {
                                this.win.webContents.send(fileid, progressData.percentage)
                            } catch (err) {

                            }
                        }
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
        } catch (err) {
            console.log('下载文件失败，请稍后重试。', err)
        }
    }
    async _getVideoInfo(event, filePath) {
        let videoDuration, videoSize
        const screenshotName = path.basename(filePath).split('.').shift() + '.png'
        const screenshotPath = path.resolve(this.settingModle(), screenshotName)

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
                        folder: this.settingModle()
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
    async _getImageInfo(path) {
        const { width, height, type } = await sizeOf(path)
        const { size } = fs.statSync(path)
        return {
            width, height, type, size
        }
    }

    async getVideoInfo(event, params) {
        const { path } = params;
        const data = await this._getVideoInfo(event, path)
        event.reply(GET_FILE_INFO_CALLBACK, { triggerType: GET_VIDEO_INFO, data })
    }

    async selectFiles(event, params) {
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