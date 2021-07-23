import React, { useEffect } from "react";
import { downloadFilesByUrl } from "../../../utils/tools";
import { ipcRenderer } from 'electron';
export const FileElem = (props: any): JSX.Element => {
    // console.log(props, '文件信息')
    const calcuSize = () => {
        const { file_elem_file_size } = props;
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
        const { file_elem_file_name } = props;

        return file_elem_file_name
    }
    const item = () => {

        return (
            <div className="message-view__item--file" onClick={showFile}>
                <div className="message-view__item--file___ext">文件</div>
                <div className="message-view__item--file___content">
                    <div className="message-view__item--file___content____name">{displayName()}</div>
                    <div className="message-view__item--file___content____size">{calcuSize()}MB</div>
                </div>
                <div className="message-view__item--file___handle"></div>
            </div>
        )
    };
    const downloadPic = (url, name) => {
        // console.log(url, name, '=++++++++++++++++++++++++++++++++++++++++')
        downloadFilesByUrl(url, name)
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
    return item();
}