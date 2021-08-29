import { CLOSE, DOWNLOADFILE, MAXSIZEWIN, MINSIZEWIN, RENDERPROCESSCALL, SHOWDIALOG, CHECK_FILE_EXIST, OPEN_CALL_WINDOW, CALL_WINDOW_CLOSE_REPLY, CLOSE_CALL_WINDOW, HIDE } from "../../app/const/const";

import { ipcRenderer, remote } from 'electron';

import { TIM_MASTER_URL_PORT,TIM_BREVIARY_URL_PORT }  from '../constants/index'
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

const hideWin = () => {
    ipcRenderer.send(RENDERPROCESSCALL, {
        type: HIDE
    })
}

const previewVvatar = (face_url, size = 40) => {
    
    return  face_url ?  face_url.replace(TIM_MASTER_URL_PORT,TIM_BREVIARY_URL_PORT)+`?imageView2/3/w/${size}/h/${size}` : ""
}

const showDialog = () => {
    ipcRenderer.send(RENDERPROCESSCALL, {
        type: SHOWDIALOG
    })
}
const downloadFilesByUrl = (url,name,fileid)=>{
    ipcRenderer.send(RENDERPROCESSCALL,{
        type:DOWNLOADFILE,
        params: {
            url,name,fileid
        }
    })
}
const checkFileExist = (path) => {
    return new Promise<boolean>((resolve)=>{
        ipcRenderer.invoke('RENDERPROCESSCALL', {
            type: CHECK_FILE_EXIST,
            params: path
        }).then((result) => {
            // ...
            resolve(result)
        }).catch(err=>{
            resolve(false)
        })
    })
}

const getParamsByKey = (key)=>{
    const paramsArr = window.location.search.slice(1).split('&');
    let res = ''
    if(paramsArr.length){
        for(let i = 0;i<paramsArr.length;i++){
            const [itemKey,itemValue] = paramsArr[i].split('=');
            if(itemKey === key){
                res = itemValue;
                break;
            }
        }
    }
    return res;
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


const dataURLtoBlob = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('file is null')
        }
        if (window.FileReader) {
            var fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onloadend = function (e) {
                resolve(e.target.result)
            }
        } else {
            reject('window.FileReader is undefined')
        }
    })
}
const convertBase64UrlToBlob = (urlData) => {

    let bytes = window.atob(urlData.split(',')[1])
    let ab = new ArrayBuffer(bytes.length)
    let ia = new Uint8Array(ab)
    for (let i = 0;i < bytes.length;i++) {
        ia[i] = bytes.charCodeAt(i)
    }
    return new Blob([ab], { type: 'image/jpeg' })
}


const highlightText = (text, content, color = '#006eff') => {
    if (!text) {
        return content
    }
    if (!content || !content.includes(text)) {
        return content
    }
    return content.replaceAll(text, `<span style='color: ${color}'>${text}</span>`)
}

const openCallWindow = (data) => {
    ipcRenderer.send(OPEN_CALL_WINDOW, data);
}

const generateRoomID = () => {
    return Math.floor(Math.random() * 1000);
}
const returnFileVla = (val,index) => {
    //截断文件名
    let start = val.replace('.'+val.split('.')[val.split('.').length-1],'');
    let end = val.split('.')[val.split('.').length-1];
    if(index) {
        return end
    }else{
        return start
    }
}

const checkfilepath = (type,file_elem_file_id,file_elem_file_name) => {
    let filelist = window.localStorage.getItem('File_list') ? JSON.parse(window.localStorage.getItem('File_list')) : '';
    if(!filelist) return false
    if(type==0 && filelist){
        //统计同名数
        let total = 0
        for (let i=0;i<filelist.length;i++){ 
            if(filelist[i].samename == file_elem_file_name) {
                total = total+1
            }
        }
        //console.log(total)
        return total
    }else if(filelist && type==1){
        //告诉有没有下载过
        for (let i=0;i<filelist.length;i++){ 
            if(filelist[i].id == file_elem_file_id) {
                return i+1
            }
        }
    }else if(filelist && type==2){
        //换本地文件名
        for (let i=0;i<filelist.length;i++){ 
            if(filelist[i].id == file_elem_file_id) {
                //console.log(filelist[i].name)
                return filelist[i].name
            }
        }
    }
}

export {
    checkfilepath,
    isWin,
    minSizeWin,
    maxSizeWin,
    closeWin,
    showDialog,
    downloadFilesByUrl,
    checkFileExist,
    generateRoomID,
    throttle,
    dataURLtoBlob,
    convertBase64UrlToBlob,
    highlightText,
    openCallWindow,
    previewVvatar,
    returnFileVla,
    hideWin,
    getParamsByKey
}