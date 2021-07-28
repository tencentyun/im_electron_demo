import React, { useEffect, useRef, useState }  from 'react';
import { message } from 'tea-component';
import {
    TRTCVideoFillMode, 
    TRTCVideoRotation,
    TRTCRenderParams,
} from "trtc-electron-sdk/liteav/trtc_define";

import event from '../event';

export const C2Cvideo = (props) => {
    const { trtcInstance } = props;
    const [ shouldShow, setShouldSHow] = useState(false);
    const selfViewRef = useRef(null);
    const remoteViewRef = useRef(null);

    useEffect(() => {
        event.on('toggleVideo', onVideoChanged);
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onRemoteUserLeaveRoom', onRemoteUserLeaveRoom);
        trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
    }, []);

    const onVideoChanged = (shouldShow) => {
        selfViewRef.current.style.display = shouldShow ? 'block' : 'none';
    }

    const onEnterRoom = (result) => {
        if(result > 0 ) {
            trtcInstance.startLocalPreview(selfViewRef.current);
            trtcInstance.startLocalAudio();
            const params = new TRTCRenderParams(TRTCVideoRotation.TRTCVideoRotation0, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
            trtcInstance.setLocalRenderParams(params);
            trtcInstance.muteLocalVideo(true);
        }
    };

    const onUserVideoAvailable = (uid, available) => {
        if (available === 1) {
            setShouldSHow(false);
            trtcInstance.startRemoteView(uid, remoteViewRef.current);
            trtcInstance.setRemoteViewFillMode(uid, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
            remoteViewRef.current.style.display = 'block';
        } else {
            remoteViewRef.current.style.display = 'none';
            setShouldSHow(true);
        }
    };

    const onRemoteUserLeaveRoom = () => {
        message.warning({content: '对方已挂断电话'});
        trtcInstance.exitRoom();
    };

    return (
        <div className="c2c-content">
            <div className="c2c-content--self" ref={selfViewRef}/>
            <div className="c2c-content--remote" ref={remoteViewRef}/>
            {
                shouldShow && <div className="c2c-content--none-video" > user</div>
            }
        </div>
    )
}