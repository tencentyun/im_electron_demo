import { BrowserWindow } from "electron";
import { CLOSE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG } from "./const/const";
const { dialog } = require('electron')
const { ipcMain } = require('electron')

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
                case SHOWDIALOG:
                    this.showDialog()
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
    showDialog(){
        dialog.showErrorBox("error","some error occur,please check")
        // dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    }
}