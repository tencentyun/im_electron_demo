import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkFileExist, downloadFilesByUrl, showDialog,returnFileVla } from "../../../utils/tools";
import { cancelSendMsg } from "../api";
import { shell } from 'electron'
import { Icon,Bubble, message as teaMessage } from "tea-component";
import path from 'path';
import os from 'os'
import { ipcRenderer } from "electron";

export const getFilePath = (fileName) => {
    return path.resolve(os.homedir(), 'Download/', 'HuaRunIM/' + fileName)
}

const FileElem = (props: any): JSX.Element => {
    const { message, element, index } = props
    const { message_conv_id, message_conv_type, message_status, message_msg_id, message_is_from_self } = message
    const { file_elem_file_name, file_elem_file_size, file_elem_file_path, file_elem_url,file_elem_file_id } = element
    const { uploadProgressList } = useSelector((state: State.RootState) => state.historyMessage);
    const progressKey = `${message_msg_id}_${index}`
    const uploadProgress = uploadProgressList.get(progressKey);
    const [FileHTML, setFileHTML] = useState(null);
    const [isDownloading,setiSDownloading] = useState(false)
    const [fileid,setFileID] = useState(message_msg_id)
    let backgroundStyle = ""
    let percentage = 0

    if (message_status === 1 && uploadProgress) {
        const { cur_size, total_size } = uploadProgress
        percentage = Math.floor((cur_size / total_size) * 100)
        backgroundStyle = message_status === 1 ? `linear-gradient(to right, #D4FFEB ${percentage}%, white 0%, white 100%)` : ""
    }

    const calcuSize = () => {
        return conver(file_elem_file_size)
    }
    const conver = (limit) => {
        var size = "";
        if (limit < 0.1 * 1024) { //如果小于0.1KB转化成B  
            size = limit.toFixed(2) + "B";
        } else if (limit < 0.1 * 1024 * 1024) {//如果小于0.1MB转化成KB  
            size = (limit / 1024).toFixed(2) + "KB";
        } else if (limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB  
            size = (limit / (1024 * 1024)).toFixed(2) + "MB";
        } else { //其他转化成GB  
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }

        var sizestr = size + "";
        var len = sizestr.indexOf("\.");
        var dec = sizestr.substr(len + 1, 2);
        if (dec == "00") {//当小数点后为00时 去掉小数部分  
            return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
        }
        return sizestr;
    }
    const showFile = () => {
        showDialog()
    }
    const displayName = () => {
        return file_elem_file_name || "null"
    }
    const getFileTypeName = () => {
        const match = file_elem_file_name.match(/\.(\w+)$/)
        return match ? match[1] : "unknow"
    }
    const handleOpen = () => {
        const p = getFilePath(checkfilepath(2))
        try {
            shell.openPath(p).catch(err => {
                shell.showItemInFolder(p)
            })
        } catch {

        }
    }
    const handleCancel = async () => {
        const { data: { json_params, code } } = await cancelSendMsg({
            conv_id: message_conv_id,
            conv_type: message_conv_type,
            message_id: message_msg_id,
            user_data: "test"
        });

        if (code === 0) {
            // dispatch(updateMessages({
            //     convId,
            //     message: JSON.parse(json_params)
            // }))
        }
    }
    const getHandleElement = async () => {
        let exits: boolean = await checkFileExist(getFilePath(checkfilepath(2)))
        console.log(exits)
        if (message_status === 1) return <Icon type="dismiss" className="message-view__item--file___close" onClick={handleCancel} />
        if (message_status === 2) {
            if (!exits) return <div className={`message-view__item--file___download${isDownloading ?' downloading' :''}`} onClick={savePic}></div>
                else return <div className="message-view__item--file___open" onClick={handleOpen}></div>
        }
    }
    const getDetailText = () => {
        if (message_status === 1) return <div className="message-view__item--file___content____size">{calcuSize()} 加速上传中 {percentage}%</div>
        if (message_status === 2) return <div className="message-view__item--file___content____size">{calcuSize()}</div>
    }
    const handleProgress = (event,data)=>{
        if(data === 100){
            setiSDownloading(false)
        }
    }
    const addProgessDownLoadListener = ()=>{
        ipcRenderer.on(fileid,handleProgress)
    }
    const removeProgressListener = ()=>{
        ipcRenderer.off(fileid,handleProgress)
    }
    const downloadPic = (url,file_elem_file_name) => {
        try {
            setiSDownloading(true)
            
            downloadFilesByUrl(url,file_elem_file_name,fileid)
        } catch (e) {
            teaMessage.error({
                content: e
            })
        }
    }
    const checkfilepath = (type) => {
        let filelist = window.localStorage.getItem('File_list') ? JSON.parse(window.localStorage.getItem('File_list')) : '';
        if(!filelist) return false
        if(type==0 && filelist){
            //统计同名数
            let total = 0
            for (let i=0;i<filelist.length;i++){ 
                if(filelist[i].name == file_elem_file_name) {
                    total = total+1
                }
            }
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
                    console.log(filelist[i].name)
                    return filelist[i].name
                }
            }
        }
    }
    const savePic = () => {
        console.log('下载地址',file_elem_url)
        if(file_elem_url){
            let filelist = []
            //缓存文件名，给另存为用
            if(window.localStorage.getItem('File_list')){
                filelist = JSON.parse(window.localStorage.getItem('File_list'))
                filelist.push({
                    url:file_elem_url,
                    name:(returnFileVla(file_elem_file_name,0)||file_elem_file_name)+'('+checkfilepath(0)+').'+returnFileVla(file_elem_file_name,1),
                    id:file_elem_file_id
                })
                downloadPic(file_elem_url,(returnFileVla(file_elem_file_name,0)||file_elem_file_name)+'('+Number(checkfilepath(0))+').'+returnFileVla(file_elem_file_name,1))
                window.localStorage.setItem('File_list',JSON.stringify(filelist));
            }else{
                filelist = [
                    {
                        url:file_elem_url,
                        name:file_elem_file_name,
                        id:file_elem_file_id
                    }
                ]
                downloadPic(file_elem_url,file_elem_file_name)
                window.localStorage.setItem('File_list',JSON.stringify(filelist));
            }
        }
    }
    const setHtml = async () => {
        const html = await getHandleElement()
        setFileHTML(html)
    }
    useEffect(() => {
        setHtml()
    }, [isDownloading])
    useEffect(()=>{
        if(fileid){
            addProgessDownLoadListener();
        }
        return ()=>{    
            removeProgressListener()
        }
    },[fileid])
    const item = () => {
        return (
            <div className="message-view__item--file" style={{ background: backgroundStyle }} onDoubleClick={showFile}>
                <div className="message-view__item--file___ext">{getFileTypeName()}</div>
                <div className="message-view__item--file___content">
                    <div className="message-view__item--file___content____name">
                    <Bubble content={displayName()}>{displayName()}</Bubble>
                    </div>
                    {getDetailText()}
                </div>
                <div className="message-view__item--file___handle">
                    {FileHTML}
                </div>
            </div>
        )
    };
    return item();
}

export default FileElem;