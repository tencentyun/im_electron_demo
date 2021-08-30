const { autoUpdater  }  = require("electron-updater");
const { ipcMain } = require('electron')
import { getParamsByKey } from '../../utils/tools';
let appWindow = null;

let feedUrl = '';//http://oaim.crbank.com.cn:30003/_download/
const env = getParamsByKey('NODE_ENV');
//判断系统位数
let agent = navigator.userAgent.toLowerCase();
// let isMac = function() {
//     return /macintosh|mac os x/i.test(navigator.userAgent);
// }();
//  const env = 'prod'
if (env === 'development' || env === 'test') {
    if (agent.indexOf("win32") >= 0 || agent.indexOf("wow32") >= 0) {
        feedUrl = 'https://oaim.uat.crbank.com.cn:30003/_download_32/'
    }else if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
        feedUrl = 'https://oaim.uat.crbank.com.cn:30003/_download/'
    }
}else{
    if (agent.indexOf("win32") >= 0 || agent.indexOf("wow32") >= 0) {
        feedUrl = 'http://oaim.crbank.com.cn:30003/_download_32/'
    }else if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
        feedUrl = 'http://oaim.crbank.com.cn:30003/_download/'
    }
}

const sendUpdateMessage = (message, data) => {
    appWindow.webContents?.send("message", {
        message,
        data,
    });
};


const checkForUpdates = () => {
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
        //console.log(progressObj);
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

const appAutoUploader = (win) => {
    appWindow = win;
    setTimeout(checkForUpdates,1000)
}

module.exports =  appAutoUploader