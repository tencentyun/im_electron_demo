import React from "react";

export const VideoElem = (props: any): JSX.Element => {
    
    const item = () => {
        return (
            <div className="message-view__item--text text right-menu-item" >
                <video style={{height: 'auto', maxWidth: '100%'}} controls poster={props.video_elem_image_url} width={props.video_elem_image_width} height={props.video_elem_image_height}>
                    <source src={props.video_elem_video_url}  />
                </video>
            </div>
        )
    };
    
    
    // console.log('视频消息',props)
    return item()
}