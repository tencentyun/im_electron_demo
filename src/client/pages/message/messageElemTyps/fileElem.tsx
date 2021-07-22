import React, { useEffect } from "react";
import { downloadFilesByUrl, showDialog } from "../../../utils/tools";

export const FileElem = (props: any): JSX.Element => {
    const calcuSize = () => {
        const { file_elem_file_size } = props;
        return (file_elem_file_size / (1024 * 1024)).toFixed(2)
    }
    const showFile = () => {
        showDialog()
    }
    const displayName = () => {
        const { file_elem_file_id } = props;

        return file_elem_file_id
    }
    const item = () => {
        
        return (
            <div className="message-view__item--file" onDoubleClick={showFile}>
                <div className="message-view__item--file___ext">png</div>
                <div className="message-view__item--file___content">
                    <div className="message-view__item--file___content____name">{displayName()}</div>
                    <div className="message-view__item--file___content____size">{calcuSize()}MB</div>
                </div>
                <div className="message-view__item--file___handle"></div>
            </div>
        )
    };
    const downloadPic = (url) => {
        downloadFilesByUrl(url)
    }
    const savePic = () => {
        // 大图、原图、缩略图
        const { file_elem_url } = props;
        file_elem_url && downloadPic(file_elem_url)
    }
    useEffect(() => {
        savePic()
    }, [])
    return item();
}