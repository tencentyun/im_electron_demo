import React, { useEffect } from "react";
<<<<<<< HEAD
import { downloadFilesByUrl } from "../../../utils/tools";
import { ipcRenderer } from 'electron';
export const FileElem = (props: any): JSX.Element => {
    // console.log(props, '文件信息')
=======
import { useSelector } from "react-redux";
import { downloadFilesByUrl, showDialog, checkFileExist } from "../../../utils/tools";
import { cancelSendMsg } from "../api";
import { shell } from 'electron'
import { Icon, message as teaMessage } from "tea-component";
import { checkPathInLS, setPathToLS } from "../../../utils/messageUtils";

export const FileElem = (props: any): JSX.Element => {
    const { message, element, index } = props
    const { message_conv_id, message_conv_type, message_status, message_msg_id, message_is_from_self } = message
    const { file_elem_file_name, file_elem_file_size, file_elem_file_path, file_elem_url } = element
    const { uploadProgressList } = useSelector((state: State.RootState) => state.historyMessage);
    const progressKey = `${message_msg_id}_${index}`
    const uploadProgress = uploadProgressList.get(progressKey);
    let   backgroundStyle = ""
    let   percentage = 0
    
    if(message_status === 1 && uploadProgress) {
        const { cur_size, total_size } = uploadProgress
        percentage = Math.floor((cur_size / total_size) * 100)
        backgroundStyle = message_status === 1 ? `linear-gradient(to right, #D4FFEB ${percentage}%, white 0%, white 100%)` : ""
    }

    const getFilePath = () => {
        const match = file_elem_url.match(/\/([\w|\.]+$)/)
        if(message_is_from_self) 
            return file_elem_file_path
        else 
            return process.cwd() + '/download/' + (match ? match[1] : "")
    }
    
>>>>>>> origin/main
    const calcuSize = () => {
        return (file_elem_file_size / (1024 * 1024)).toFixed(2)
    }
    const showFile = () => {
        const { file_elem_file_name } = props;
        // filename 
        ipcRenderer.send('OPENFILE', {
            filename: file_elem_file_name
        })
    }
    const displayName = () => {
<<<<<<< HEAD
        const { file_elem_file_name } = props;

        return file_elem_file_name
    }
    const item = () => {

        return (
            <div className="message-view__item--file" onClick={showFile}>
                <div className="message-view__item--file___ext">文件</div>
=======
        return file_elem_file_name
    }
    const getFileTypeName = () => {
        const match = file_elem_file_name.match(/\.(\w+)$/)
        return match ? match[1] : "unknow"
    }
    const handleOpen = () => {
        shell.showItemInFolder(getFilePath())
    }
    const handleCancel = async () => {
        console.log(111110000)
        const {data: {json_params, code}} = await cancelSendMsg({
            conv_id: message_conv_id,
            conv_type: message_conv_type,
            message_id: message_msg_id,
            user_data: "test"
        });

        if (code === 0) {
            console.log(11112222)
            // dispatch(updateMessages({
            //     convId,
            //     message: JSON.parse(json_params)
            // }))
        }
        console.log(11113333, code)
    }
    const getHandleElement = () => {
        if(message_status === 1) return <Icon type="dismiss" className="message-view__item--file___close" onClick={handleCancel} />
        if(message_status === 2) {
            if(message_is_from_self) {
                return <div className="message-view__item--file___open" onClick={handleOpen}></div>
            } else {
                if(!checkPathInLS(getFilePath())) return <div className="message-view__item--file___download" onClick={savePic}></div>
                else return <div className="message-view__item--file___open" onClick={handleOpen}></div>
            }
        }
    }
    const getDetailText = () => {
        if(message_status === 1) return <div className="message-view__item--file___content____size">{calcuSize()}MB 加速上传中 {percentage}%</div>
        if(message_status === 2) return <div className="message-view__item--file___content____size">{calcuSize()}MB</div>
    }
    const downloadPic = (url) => {
        const basePath = process.cwd() + '/download/'
        try {
            downloadFilesByUrl(url)
            setPathToLS(getFilePath())
        } catch(e){
            teaMessage.error({
                content: e
            })
        }
    }
    const savePic = () => {
        file_elem_url && downloadPic(file_elem_url)
    }
    const item = () => {
        return (
            <div className="message-view__item--file" style={{background: backgroundStyle}} onDoubleClick={showFile}>
                <div className="message-view__item--file___ext">{getFileTypeName()}</div>
>>>>>>> origin/main
                <div className="message-view__item--file___content">
                    <div className="message-view__item--file___content____name">{displayName()}</div>
                    { getDetailText() }
                </div>
                <div className="message-view__item--file___handle">
                    { getHandleElement() }
                </div>
            </div>
        )
    };
<<<<<<< HEAD
    const downloadPic = (file_url, file_name) => {
        const params = {file_url,file_name}
        downloadFilesByUrl(params)
    }
    const savePic = () => {
        // 大图、原图、缩略图
        const { file_elem_url, file_elem_file_name } = props;
        // console.log(file_elem_url, '图片下载地址', file_elem_file_name)
        file_elem_url && downloadPic(file_elem_url, file_elem_file_name)
    }
    useEffect(() => {
        savePic()
    }, [])
    //    console.log('fileElem',props)
=======
>>>>>>> origin/main
    return item();
}