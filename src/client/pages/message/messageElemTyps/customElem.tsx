import React, { useEffect } from "react";
import { ImagePreview } from 'tea-component'
export const CustomElem = (props: any): JSX.Element => {
    
    const item = (props) => {
        const { custom_elem_data, custom_elem_desc } = props
        return (
            <div className="message-view__item--text text right-menu-item" >
                {

                    custom_elem_data === 'CUST_EMOJI' ?
                       
                        <ImagePreview
                            previewSrc={custom_elem_desc}
                            previewTitle="预览"
                        >
                            {open => <a onClick={open}> <img src={custom_elem_desc} style={{ maxWidth: 178 }} /></a>}
                        </ImagePreview>
                        : JSON.stringify(props)
                    
                }
            </div>
        )
    };
   
    return item(props);
}