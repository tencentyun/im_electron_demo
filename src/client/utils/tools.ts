import { CLOSE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL } from "../../const/const";

const { ipcRenderer } = require('electron')
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
export {
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin
}