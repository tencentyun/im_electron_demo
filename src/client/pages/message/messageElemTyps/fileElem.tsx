import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkFileExist, downloadFilesByUrl, showDialog } from "../../../utils/tools";
import { cancelSendMsg } from "../api";
import { shell } from 'electron'
import { Icon, message as teaMessage } from "tea-component";
import path from 'path';
import os from 'os'

const FileElem = (props: any): JSX.Element => {
    const { message, element, index } = props
    const { message_conv_id, message_conv_type, message_status, message_msg_id, message_is_from_self } = message
    const { file_elem_file_name, file_elem_file_size, file_elem_file_path, file_elem_url } = element
    const { uploadProgressList } = useSelector((state: State.RootState) => state.historyMessage);
    const progressKey = `${message_msg_id}_${index}`
    const uploadProgress = uploadProgressList.get(progressKey);
    const [FileHTML, setFileHTML] = useState(null);
    let backgroundStyle = ""
    let percentage = 0

    if (message_status === 1 && uploadProgress) {
        const { cur_size, total_size } = uploadProgress
        percentage = Math.floor((cur_size / total_size) * 100)
        backgroundStyle = message_status === 1 ? `linear-gradient(to right, #D4FFEB ${percentage}%, white 0%, white 100%)` : ""
    }

    const getFilePath = () => {
        return path.resolve(os.homedir(), 'Download/', 'HuaRunIM/' + file_elem_file_name)
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
        const p = getFilePath()
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
        const exits: boolean = await checkFileExist(getFilePath())
        if (message_status === 1) return <Icon type="dismiss" className="message-view__item--file___close" onClick={handleCancel} />
        if (message_status === 2) {
            if (message_is_from_self) {
                return <div className="message-view__item--file___open" onClick={handleOpen}></div>
            } else {
                if (!exits) return <div className="message-view__item--file___download" onClick={savePic}></div>
                else return <div className="message-view__item--file___open" onClick={handleOpen}></div>
            }
        }
    }
    const getDetailText = () => {
        if (message_status === 1) return <div className="message-view__item--file___content____size">{calcuSize()} 加速上传中 {percentage}%</div>
        if (message_status === 2) return <div className="message-view__item--file___content____size">{calcuSize()}</div>
    }
    const downloadPic = (url,file_elem_file_name) => {
        try {
            downloadFilesByUrl(url,file_elem_file_name)
        } catch (e) {
            teaMessage.error({
                content: e
            })
        }
    }
    const savePic = () => {
        file_elem_url && downloadPic(file_elem_url,file_elem_file_name)
    }
    const setHtml = async () => {
        const html = await getHandleElement()
        setFileHTML(html)
    }
    useEffect(() => {
        setHtml()
    }, [])
    const item = () => {
        return (
            <div className="message-view__item--file" style={{ background: backgroundStyle }} onDoubleClick={showFile}>
                <div className="message-view__item--file___ext">{getFileTypeName()}</div>
                <div className="message-view__item--file___content">
                    <div className="message-view__item--file___content____name">{displayName()}</div>
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