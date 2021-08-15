import { shell } from "electron";
import React, { useEffect } from "react";
import { downloadFilesByUrl } from "../../../utils/tools";
import withMemo from "../../../utils/componentWithMemo";
import path from 'path'
import os from 'os'
const PicElemItem = (props: any): JSX.Element => {
    const showPic = () => {
        try {
            const imageName = props.image_elem_orig_id.split('_').pop()
            const p = path.resolve(os.homedir(), 'Download/','HuaRunIM/' + imageName)
            console.log(p)
            shell.openPath(p)
        } catch(e) {}
    }
    const item = ({ image_elem_thumb_url, image_elem_orig_url, image_elem_large_url }) => {
        const url = image_elem_thumb_url || image_elem_orig_url || image_elem_large_url
        return (
            <div className="message-view__item--text text right-menu-item" onDoubleClick={showPic}>
                <img src={url} style={{ maxWidth: '100%' }}></img>
            </div>
        )
    };
    const downloadPic = (url) => {
        downloadFilesByUrl(url)
    }
    const savePic = () => {
        // 大图、原图、缩略图
        const { image_elem_orig_url } = props;
        image_elem_orig_url && downloadPic(image_elem_orig_url)
    }
    useEffect(() => {
        savePic()
    }, [])
    return item(props);
}

export default withMemo(PicElemItem);