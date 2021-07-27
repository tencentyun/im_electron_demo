import { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG, CHECK_FILE_EXIST } from "../../app/const/const";

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
const checkFileExist = (path) =>{
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:CHECK_FILE_EXIST,
        params:path
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

//file对象转换为Blob对象 
const dataURLtoBlob = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('file is null')
        }
        if (window.FileReader) {
            var fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onloadend = function (e) {
                resolve(e.target.result)
            }
        } else {
            reject('window.FileReader is undefined')
        }
    })
}
const convertBase64UrlToBlob = (urlData) => {
    // 去掉url的头，并转换为byte
    let bytes = window.atob(urlData.split(',')[1])
    let ab = new ArrayBuffer(bytes.length)
    let ia = new Uint8Array(ab)
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
    }
    return new Blob([ab], { type: 'image/jpeg' })
}

/**
 * 文字高亮
 */
const highlightText = (text, content, color = '#006eff') => {
    if (!text) {
      return content
    }
    if (!content || !content.includes(text)) {
      return content
    }
    return content.replaceAll(text, `<span style='color: ${color}'>${text}</span>`)
}
export {
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin,
    showDialog,
    downloadFilesByUrl,
    checkFileExist,
    throttle,
    dataURLtoBlob,
    convertBase64UrlToBlob,
    highlightText
}