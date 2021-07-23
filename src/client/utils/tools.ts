import { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG, CHECK_FILE_EXIST } from "../../app/const/const";

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
const downloadFilesByUrl = (url)=>{
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:DOWNLOADFILE,
        params:url
    })
}
const checkFileExist = (path) =>{
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:CHECK_FILE_EXIST,
        params:path
    })
}
export {
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin,
    showDialog,
    downloadFilesByUrl,
    checkFileExist
}