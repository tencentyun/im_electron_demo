import { CLOSE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL } from "../../const/const";

import  { ipcRenderer, remote } from 'electron';

const dialog = remote.dialog;
const WIN = remote.getCurrentWindow();

const isWin = () => {
    return process.platform === 'win32';
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

const openDialog = (options) => dialog.showOpenDialog(WIN, options);

export {
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin,
    openDialog
}