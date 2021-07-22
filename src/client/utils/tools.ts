import { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG } from "../../const/const";

import { ipcRenderer, remote } from 'electron';

const dialog = remote.dialog;
const WIN = remote.getCurrentWindow();

const isWin = () => {
    const platform = process.platform;
    return platform === 'win32' || platform === 'linux';
}
const minSizeWin = () => {
    ipcRenderer.send(RENDERPROCESSCALL, {
        type: MINSIZEWIN
    })
}
const maxSizeWin = () => {
    ipcRenderer.send(RENDERPROCESSCALL, {
        type: MAXSIZEWIN
    })
}
const closeWin = () => {
    ipcRenderer.send(RENDERPROCESSCALL, {
        type: CLOSE
    })
}

const showDialog = () => {
    ipcRenderer.send(RENDERPROCESSCALL, {
        type: SHOWDIALOG
    })
}
const downloadFilesByUrl = (params) => {
    // console.log('11111111111', url, name)
    // const params = { url, name }
    ipcRenderer.send(RENDERPROCESSCALL, {
        type: DOWNLOADFILE,
        params
    })
}
const throttle = (fn, delay) => {
    let timer
    let t_start = Date.now()
    return function (...args) {
        const context = this as any
        const t_curr = Date.now()
        clearTimeout(timer)
        if (t_curr - t_start >= delay) {
            fn.apply(context, args)
            t_start = t_curr
        } else {
            timer = setTimeout(() => {
                fn.apply(context, args)
            }, delay)
        }
    }
}
export {
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin,
    showDialog,
    downloadFilesByUrl,
    throttle
}