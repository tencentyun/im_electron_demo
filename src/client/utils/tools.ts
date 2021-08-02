import { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG, CHECK_FILE_EXIST, OPEN_CALL_WINDOW, CALL_WINDOW_CLOSE_REPLY } from "../../app/const/const";

import  { ipcRenderer, remote } from 'electron';
import { v4 as uuidv4 } from 'uuid';
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

const openCallWindow = (data) => {
    ipcRenderer.send(OPEN_CALL_WINDOW, data);
}

const callWindowCloseListiner = (callback) => {
    ipcRenderer.on(CALL_WINDOW_CLOSE_REPLY, callback);
};
const generateRoomID = () => {
    return Math.floor(Math.random() * 1000);
}
export {
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin,
    showDialog,
    downloadFilesByUrl,
    checkFileExist,
    openCallWindow,
    callWindowCloseListiner,
    generateRoomID
}