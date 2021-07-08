import { BrowserWindow } from "electron";
import { CLOSE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL } from "./const/const";

const {ipcMain} = require('electron')

export default class IPC {
    win:BrowserWindow = null;
    constructor(win:BrowserWindow){
        this.win = win;
        ipcMain.on(RENDERPROCESSCALL,(event,data) => {
            console.log("get message from render process",event.processId,data)
            const { type }  = data;
            switch (type){
                case MINSIZEWIN:
                    this.minsizewin();
                    break;
                case MAXSIZEWIN:
                    this.maxsizewin();
                    break;
                case CLOSE:
                    this.close();
                    break;
            }
        })
    }
    minsizewin(){
        this.win.minimize()
    }
    maxsizewin(){
        this.win.maximize()
    }
    close(){
        this.win.close()
    }
}