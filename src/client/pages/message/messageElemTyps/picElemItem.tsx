import { shell } from "electron";
import React, { useEffect } from "react";
import { downloadFilesByUrl } from "../../../utils/tools";
import withMemo from "../../../utils/componentWithMemo";
import Store from "electron-store";
const store = new Store()
const PicElemItem = (props: any): JSX.Element => {
    const showPic = () => {
        try {
            const imageName = props.image_elem_orig_id
            const p =  store.get('setting') + `${imageName}`
            shell.openPath(p)
        } catch(e) {}
    }
    const item = ({ image_elem_thumb_url, image_elem_orig_url, image_elem_large_url,  image_elem_orig_path }) => {
        const url = image_elem_thumb_url || image_elem_orig_url || image_elem_large_url || image_elem_orig_path
        return (
            <div className="message-view__item--text text right-menu-item" onDoubleClick={showPic}>
                <img src={url} style={{ maxWidth: '100%' }}></img>
            </div>
        )
    };
    const downloadPic = (url,name,fileid) => {
        downloadFilesByUrl(url,name,fileid)
    }
    const savePic = () => {
        // 大图、原图、缩略图
        const { image_elem_orig_url ,image_elem_orig_id,} = props;
        image_elem_orig_url && downloadPic(image_elem_orig_url,image_elem_orig_id,props.message?.message_msg_id)
    }
    useEffect(() => {
        savePic()
    }, [])
    return item(props);
}

export default withMemo(PicElemItem);