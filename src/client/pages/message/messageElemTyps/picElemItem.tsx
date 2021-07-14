import React from "react";
import { showDialog } from "../../../utils/tools";

export const PicElemItem = (props: any): JSX.Element => {
    const showPic = ()=>{
        showDialog()
    }
    const item = ({ image_elem_thumb_url }) => (
        <div className="message-view__item--text text right-menu-item" onClick={showPic}>
            <img src={image_elem_thumb_url}></img>
        </div>
    );
    console.log(props, 'picinfo')
    return item(props);
}