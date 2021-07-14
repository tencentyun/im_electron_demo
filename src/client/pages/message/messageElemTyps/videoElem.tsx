import React, { useEffect, useRef, useState } from "react";
import DPlayer from 'dplayer';

export const VideoElem = (props: any): JSX.Element => {
    const [video,setVideo] = useState(null)
    const videoRef = useRef(null)
    const item = () => {
        return (
            <div className="message-view__item--text text right-menu-item" >
                <div className="dp_video_render" ref={videoRef}></div>
            </div>
        )
    };
    const initVideo = ()=>{
        const { video_elem_image_url,video_elem_video_url } = props
        if(videoRef.current){
            setVideo(new DPlayer({
                container: videoRef.current,
                video: {
                    url: video_elem_video_url,
                    pic: video_elem_image_url,
                    thumbnails: video_elem_image_url,
                    type: 'auto',
                },
                autoplay:false
            }))
        }
    }
    useEffect(()=>{
        initVideo()
    },[videoRef.current])
    console.log('视频消息',props)
    return item()
}