const { ipcMain, BrowserWindow, screen } = require('electron');
const path = require('path')
const url = require('url');
const log = require('electron-log');

const { OPEN_CALL_WINDOW, CLOSE_CALL_WINDOW, END_CALL_WINDOW, CALL_WINDOW_CLOSE_REPLY } = require("./const/const");


const getSrceenSize = () => {
    const display = screen.getPrimaryDisplay();
    return display.size;
}

class CallWindowIpc {
    callWindow = null;
    imWindow = global.sharedObject.appWindow;
    readyToShowWindow = false;

    constructor() {
        this.mount();
    }

    mount() {
        this.createWindow();
        this.addEventListiner();
    }

    destroy() {
        this.offEventListiner();
        this.addEventListiner();
    }

    createWindow() {
        this.callWindow = null;
        const { NODE_ENV, HUARUN_ENV } = process.env;
        const isDev = NODE_ENV?.trim() === 'development';
        const callWindow = new BrowserWindow({
            height: 600,
            width: 800,
            show: false,
            frame: false,
            resizable: false,
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
            callWindow.loadURL(`http://localhost:3000/call.html?NODE_ENV=${NODE_ENV}&HUARUN_ENV=${HUARUN_ENV}`);
        } else {
            //callWindow.webContents.openDevTools(); //正式生产不需要开启
            callWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, `../../bundle/call.html?NODE_ENV=${NODE_ENV}&HUARUN_ENV=${HUARUN_ENV}`),
                    protocol: 'file:',
                    slashes: true
                })
            );
        }

        callWindow.on('ready-to-show', () => {
            this.readyToShowWindow = true;  
        });

        this.readyToShowWindow = false;

        this.callWindow = callWindow;
    }

    addEventListiner() {
        const { NODE_ENV } = process.env;
        const isDev = NODE_ENV?.trim() === 'development';
        const screenSize = getSrceenSize();
        // 当作为接收方，接受电话后，更改窗口尺寸。
        ipcMain.on('change-window-size', (event, acceptParams) => {
            // 向聊天窗口通信
            const { isVoiceCall } = acceptParams;
            const windowWidth = isVoiceCall ? 400 : 800;
            const windowHeight = isVoiceCall ? 650 : 600;

            const positionX = Math.floor((screenSize.width - windowWidth) / 2);
            const positionY = Math.floor((screenSize.height - windowHeight) / 2);

            this.callWindow.setSize(windowWidth, windowHeight);
            this.callWindow.setPosition(positionX, positionY);
        });

        ipcMain.on('accept-call', (event, inviteID) => {
            this.imWindow.webContents.send('accept-call-reply', inviteID);
        })

        // 当作为接收方，挂断电话，关闭窗口
        ipcMain.on('refuse-call', (event, inviteID) => {
            this.callWindow.close();
            // 向聊天窗口通信
            this.imWindow.webContents.send('refuse-call-reply', inviteID);
        });

        // 当接受方拒绝通话后，调用该方法可关闭窗口，并退出房间
        ipcMain.on(CLOSE_CALL_WINDOW, () => {
            this.callWindow.webContents.send('exit-room');
        });

        ipcMain.on(END_CALL_WINDOW, () => {
            this.callWindow.close()
        })
        // 远端用户进入
        ipcMain.on('remote-user-join', (event, userId) => {
            this.imWindow.webContents.send('remote-user-join-reply', userId)
        });

        // 远端用户离开
        ipcMain.on('remote-user-exit', (event, userId) => {
            this.imWindow.webContents.send('remote-user-exit-reply', userId)
        });

        // 取消通话邀请
        ipcMain.on('cancel-call-invite', (event, data) => {
            this.imWindow.webContents.send('cancel-call-invite-reply', data);
        });

        // 更新邀请列表(当用户拒绝邀请后，需通知通话窗口)
        ipcMain.on('update-invite-list', (event, inviteList) => {
            this.callWindow.webContents.send('update-invite-list', inviteList);
        });

        ipcMain.on(OPEN_CALL_WINDOW, (event, data) => {
            const addSdkAppid = {
                ...data,
                sdkAppid: "1400529075"
            };
            log.info('===========openCallWindow 参数========', addSdkAppid);
            const params = JSON.stringify(addSdkAppid);
            const { convInfo: { convType }, callType } = data;
            if (data.windowType === 'notificationWindow') {
                this.callWindow.setSize(320, 150);
                this.callWindow.setPosition(screenSize.width - 340, screenSize.height - 200);
            } else if (convType === 1 && Number(callType) === 1) {
                this.callWindow.setSize(400, 650);
                this.callWindow.setPosition(Math.floor((screenSize.width - 400) / 2), Math.floor((screenSize.height - 650) / 2));
            }

            const showWindow = (timer) => {
                this.callWindow.show();
                this.callWindow.webContents.send('pass-call-data', params);
                isDev && this.callWindow.webContents.openDevTools();
                timer && clearInterval(timer);
            }

            if(this.readyToShowWindow) {
                showWindow();
            } else {
                const timer = setInterval(() => {
                    if(this.readyToShowWindow) {
                        showWindow(timer);
                    }
                }, 10);

            }
        });

        this.callWindow.on('close', () => {
            this.createWindow();
        });

        this.callWindow.on('closed', () => {
            this.imWindow.webContents.send(CALL_WINDOW_CLOSE_REPLY);
            this.destroy();
        });
    }

    offEventListiner() {
        ipcMain.removeAllListeners(OPEN_CALL_WINDOW);
        ipcMain.removeAllListeners('change-window-size');

        ipcMain.removeAllListeners('accept-call')

        // 当作为接收方，挂断电话，关闭窗口
        ipcMain.removeAllListeners('refuse-call');

        // 当接受方拒绝通话后，调用该方法可关闭窗口，并退出房间
        ipcMain.removeAllListeners(CLOSE_CALL_WINDOW);

        ipcMain.removeAllListeners(END_CALL_WINDOW)
        // 远端用户进入
        ipcMain.removeAllListeners('remote-user-join');

        // 远端用户离开
        ipcMain.removeAllListeners('remote-user-exit');

        // 取消通话邀请
        ipcMain.removeAllListeners('cancel-call-invite');

        // 更新邀请列表(当用户拒绝邀请后，需通知通话窗口)
        ipcMain.removeAllListeners('update-invite-list');
    }
};

module.exports = CallWindowIpc;