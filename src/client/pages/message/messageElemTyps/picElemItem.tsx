import React, { useEffect } from "react";
import { downloadFilesByUrl, showDialog } from "../../../utils/tools";
const showPic = () => {
        showDialog()
    }

export const PicElemItem = (props: any): JSX.Element => {
  
    const item = ({ image_elem_thumb_url, image_elem_orig_url, image_elem_large_url }) => {

        const url = image_elem_thumb_url || image_elem_orig_url || image_elem_large_url
        return (
            <div className="message-view__item--text text right-menu-item">

                <img className="message-pic" src={url} style={{ maxWidth: 450 }}></img>
            </div>
        )
    };
    const downloadPic = (file_url, file_name) => {
        const params = {file_url,file_name}
        downloadFilesByUrl(params)
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