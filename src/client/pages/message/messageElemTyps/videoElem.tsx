import React from "react";

export const VideoElem =React.memo((props: any): JSX.Element => {
    const autoRate =  200 / props.video_elem_image_width;
    
    const item = () => {
        return (
            <div className="message-view__item--text text right-menu-item" >
                {
                    <video style={{height: props.video_elem_image_height * autoRate, maxWidth: '100%'}} controls poster={props.video_elem_image_url} width={props.video_elem_image_width} height={props.video_elem_image_height}>
                        <source src={props.video_elem_video_url}  />
                    </video>
                }
            </div>
        )
    };
    
    
    // console.log('视频消息',props)
    return item()
})