import { CLOSE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG } from "../../const/const";

import  { ipcRenderer, remote } from 'electron';

const dialog = remote.dialog;
const WIN = remote.getCurrentWindow();

const isWin = () => {
    const platform = process.platform;
    return platform === 'win32' || platform === 'linux';
}
const minSizeWin = () => {
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:MINSIZEWIN
    })
}
const maxSizeWin = () => {
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:MAXSIZEWIN
    })
}
const closeWin = () => {
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:CLOSE
    })
}

const showDialog = ()=>{
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:SHOWDIALOG
    })
}

export {
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin,
    showDialog
}