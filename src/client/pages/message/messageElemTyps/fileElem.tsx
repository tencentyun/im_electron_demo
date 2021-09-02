import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkFileExist, downloadFilesByUrl, showDialog,returnFileVla,checkfilepath, getNativePath } from "../../../utils/tools";
import { cancelSendMsg } from "../api";
import { shell } from 'electron'
import { Icon,Bubble, message as teaMessage } from "tea-component";
import path from 'path';
import os from 'os'
import { ipcRenderer } from "electron";
import { updateMessages } from "../../../store/actions/message";

export const getFilePath = (fileName) => {
    return path.resolve(os.homedir(), 'Download/', 'HuaRunIM/' + fileName)
}

const FileElem = (props: any): JSX.Element => {
    const { message, element, index,isshow } = props
    const { message_conv_id, message_conv_type,  message_msg_id, message_is_from_self} = message
    const { file_elem_file_name, file_elem_file_size, file_elem_file_path, file_elem_url,file_elem_file_id } = element
    const { uploadProgressList } = useSelector((state: State.RootState) => state.historyMessage);
    
    const [FileHTML, setFileHTML] = useState(null);
    const [isDownloading,setiSDownloading] = useState(false)
    const [fileid,] = useState(message_msg_id)
    const [message_status,setmessage_status] = useState(message.message_status)
    const dispatch = useDispatch()
    const [backgroundStyle,setbackgroundStyle] = useState("")
    const [percentage,setpercentage] = useState(0)
    const [exits,setexits] = useState(false)
    const progressKey = `${message_msg_id}_${index}`
    const uploadProgress = uploadProgressList.get(progressKey);
    useEffect(()=>{
        if (uploadProgress) {
            const { cur_size, total_size } = uploadProgress
            setpercentage(Math.floor((cur_size / total_size) * 100))
            setbackgroundStyle(message_status === 1 ? `linear-gradient(to right, #D4FFEB ${percentage}%, white 0%, white 100%)` : "")
            
        }
        setmessage_status(message.message_status)
    },[uploadProgress, message, message_status])
    const calcuSize = () => {
        //console.log(file_elem_file_size)
        getHandleElement()
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
        const arrayList = ['txt','pdf','doc','docx','zip','xlsx','xls','doc','docx','exe','ppt','pptx']
        if(match){
            if(arrayList.indexOf(match[1])>-1){
                return match ? match[1]+'-' : "unknow"
            }else{
                return match ? match[1] : "unknow"
            }
        }else{
            return "unknow"
        }
    }

    const handleOpen = async () => {
        let data = await checkFileExist(message_msg_id)
        if(data){
            const { path } = data;
            try {
                shell.openPath(path).catch(err => {
                    shell.showItemInFolder(path)
                })
            } catch {
    
            }
        }
        
    }
    const handleCancel = async () => {
        const { data: { json_params, code } } = await cancelSendMsg({
            conv_id: message_conv_id,
            conv_type: message_conv_type,
            message_id: message_msg_id,
            user_data: "test"
        });

        const messageData = {
            ...JSON.parse(json_params),
            message_status: 3
        }
        if (code === 0) {
            dispatch(updateMessages({
                convId: message_conv_id,
                message: messageData
            }))
        }
    }
    const getHandleElement = () => {
        
        if (message_status === 1) {
            return <Icon type="dismiss" className="message-view__item--file___close" onClick={handleCancel} />
        }
        else if (message_status === 2) {
            if (exits) {
                return <div className="message-view__item--file___open" title="打开文件" onClick={handleOpen}></div>
            }else {
                return <div className={`message-view__item--file___download${isDownloading ?' downloading' :''}`} title="下载" onClick={savePic}></div>
            }
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
    const downloadPic = (url,file_elem_file_name,file_id) => {
        try {
            setiSDownloading(true)
            downloadFilesByUrl(url,file_elem_file_name,fileid)
        } catch (e) {
            teaMessage.error({
                content: e
            })
        }
    }
    
    
    const savePic = () => {
        // console.log('下载地址',file_elem_url)
        // if(file_elem_url){
        //     let filelist = []
        //     //缓存文件名，给另存为用
        //     if(window.localStorage.getItem('File_list') && window.localStorage.getItem('File_list')!= 'null'){
        //         filelist = JSON.parse(window.localStorage.getItem('File_list'))
        //         filelist.push({
        //             url:file_elem_url,
        //             name:(returnFileVla(file_elem_file_name,0)||file_elem_file_name)+'('+checkfilepath(0,file_elem_file_id,file_elem_file_name)+').'+returnFileVla(file_elem_file_name,1),
        //             samename:file_elem_file_name,
        //             id:file_elem_file_id
        //         })
        //         downloadPic(file_elem_url,(returnFileVla(file_elem_file_name,0)||file_elem_file_name)+'('+Number(checkfilepath(0,file_elem_file_id,file_elem_file_name))+').'+returnFileVla(file_elem_file_name,1))
        //         window.localStorage.setItem('File_list_save',JSON.stringify(filelist));
        //     }else{
        //         filelist = [
        //             {
        //                 url:file_elem_url,
        //                 name:file_elem_file_name,
        //                 samename:file_elem_file_name,
        //                 id:file_elem_file_id
        //             }
        //         ]
                
        //         window.localStorage.setItem('File_list_save',JSON.stringify(filelist));
        //     }
        // }
        downloadPic(file_elem_url,file_elem_file_name,message_msg_id)
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
    useEffect(()=>{
        check()
    },[message_msg_id,isDownloading])
    const check = async ()=>{
        let ex = await checkFileExist(message_msg_id)
        setexits(ex)
    }
    return (
        <div className="message-view__item--file" style={{ background: backgroundStyle }} onDoubleClick={showFile}>
            <div className={`message-view__item--file___ext message-view__item--file___${ getFileTypeName()}`}>{getFileTypeName().substring(getFileTypeName().length-1,getFileTypeName().length) == '-'?'':getFileTypeName()}</div>
            <div className="message-view__item--file___content">
                <div className="message-view__item--file___content____name">
                <Bubble content={displayName()}>{displayName()}</Bubble>
                </div>
                {getDetailText()}
            </div>
            <div className="message-view__item--file___handle">
                {
                    getHandleElement()
                }
            </div>
        </div>
    )
}

export default FileElem;