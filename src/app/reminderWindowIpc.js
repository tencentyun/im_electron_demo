const { ipcMain, BrowserWindow, screen } = require('electron');
const { OPEN_REMINDER_WINDOW } = require("./const/reminderConst");
const path = require('path')
const url = require('url');
const log = require('electron-log');


const getSrceenSize = () => {
    const display = screen.getPrimaryDisplay();
    return display.size;
}

class ReminderWindowIpc {
    reminderWindow = null;
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

    createWindow(){
        this.reminderWindow = null;
        const { NODE_ENV, HUARUN_ENV } = process.env;
        // const  NODE_ENV = 'development' , HUARUN_ENV = "test"
        // const  NODE_ENV = 'production' , HUARUN_ENV = "prod"
        const isDev = NODE_ENV?.trim() === 'development';
        const remindWindow = new BrowserWindow({
            height: 150,
            width: 320,
            x:Math.floor(getSrceenSize().width - 340),
            y:Math.floor(getSrceenSize().height - 200),
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
        remindWindow.removeMenu();
        if (isDev) {
            remindWindow.loadURL(`http://localhost:3000/reminder.html?NODE_ENV=${NODE_ENV}&HUARUN_ENV=${HUARUN_ENV}`);
        } else {
            //callWindow.webContents.openDevTools(); //正式生产不需要开启
            remindWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, `../../bundle/reminder.html`),
                    protocol: 'file:',
                    slashes: true
                })
            );
        }

        remindWindow.on('ready-to-show', () => {
            this.readyToShowWindow = true;  
        });

        this.readyToShowWindow = false;

        
        this.reminderWindow = remindWindow;

        console.log("reminderWindow" , this.reminderWindow)
    }

    addEventListiner() {
        const { NODE_ENV } = process.env;
        const isDev = NODE_ENV?.trim() === 'development';
        ipcMain.on(OPEN_REMINDER_WINDOW, (event, data) => {
            log.info('===========openReminder 参数========', data);
            const params = JSON.stringify(data);

            const showWindow = (timer) => {
                this.reminderWindow.show();
                this.reminderWindow.webContents.send('reminder-creat-data', params);
                isDev && this.reminderWindow.webContents.openDevTools();
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
        })

        this.reminderWindow.on('close', (event) => {
            try {
                this.reminderWindow = null
                this.createWindow()
            } catch(err) {
                console.log(err);
            }
        });

        this.callWindow.on('closed', () => {
            try {
                this.reminderWindow = null
                this.imWindow?.webContents.send('reminder-exit');
                this.destroy();
            } catch (err) {
                console.log(err);
            }
        });
    }

    offEventListiner() {
        ipcMain.removeAllListeners(OPEN_REMINDER_WINDOW);
    }
}

module.exports = ReminderWindowIpc;