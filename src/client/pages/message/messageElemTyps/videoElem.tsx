import React, { useRef, useEffect } from "react";
import Dplayer from 'dplayer'

const ininVideoPlayer = (props) => {
    const videoDom = useRef()
    const videoDomId = new Date().getTime().toString() + Math.floor(Math.random() * 1000).toString()
    useEffect(() => {
        const dom = document.getElementById(videoDomId)
        if (dom) {
            new Dplayer({
                container: dom,
                video: {
                    url: props.video_elem_video_url
                }
            })
        }
    }, [videoDom])

    return (
        <div style={{ margin: '-16px' }}>
            <div ref={videoDom} id={videoDomId} style={{ width: '100%', display: 'inherit', maxHeight: '300px' }} className="message-video"></div>
        </div>
    )
}

export const VideoElem = (props: any): JSX.Element => {
    const item = () => {
        return (
            props.video_elem_video_duration ?
            <div className="message-view__item--text text right-menu-item" style={{minWidth:'350px',maxWidth:'auto'}}>
                {
                    ininVideoPlayer(props)
                }
                {/* <video controls poster={props.video_elem_image_url} width={props.video_elem_image_width} height={props.video_elem_image_height}>
                    <source src={props.video_elem_video_url}  />
                </video> */}
            </div>
            : null
        )
    };
    return item()
}