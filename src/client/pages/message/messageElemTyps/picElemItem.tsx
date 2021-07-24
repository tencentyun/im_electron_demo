import React, { useEffect } from "react";
import { downloadFilesByUrl, showDialog } from "../../../utils/tools";
import {ImagePreview} from 'tea-component'

export const PicElemItem = (props: any): JSX.Element => {
    const showPic = () => {
        showDialog()
    }
    const item = ({ image_elem_thumb_url, image_elem_orig_url, image_elem_large_url }) => {
        const url = image_elem_thumb_url || image_elem_orig_url || image_elem_large_url
        return (
            <div className="message-view__item--text text right-menu-item111">
                <ImagePreview
                    previewSrc={url}
                    previewTitle="预览"
                >
                {open => <a onClick={open}><img src={url} style={{ maxWidth: 450 }}></img></a>}
                </ImagePreview>
            </div>
        )
    };
    const downloadPic = (url, name) => {
        downloadFilesByUrl(url, name)
    }
    const savePic = () => {
        // 大图、原图、缩略图
        const { image_elem_orig_url, image_elem_thumb_id } = props;
        console.log(image_elem_orig_url, '__________________________________', props)
        image_elem_orig_url && downloadPic(image_elem_orig_url, image_elem_thumb_id)
    }
    useEffect(() => {
        savePic()
    }, [])
    return item(props);
}