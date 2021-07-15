import React, { useEffect } from "react";
import { downloadFilesByUrl, showDialog } from "../../../utils/tools";

export const PicElemItem = (props: any): JSX.Element => {
    const showPic = () => {
        showDialog()
    }
    const item = ({ image_elem_thumb_url, image_elem_orig_url, image_elem_large_url }) => {
        const url = image_elem_thumb_url || image_elem_orig_url || image_elem_large_url
        return (
            <div className="message-view__item--text text right-menu-item" onDoubleClick={showPic}>
                <img src={url} style={{ maxWidth: 450 }}></img>
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