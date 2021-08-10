import React, { useEffect, useRef, useState } from 'react';
import {
    TRTCVideoFillMode,
    TRTCVideoRotation,
    TRTCRenderParams,
} from "trtc-electron-sdk/liteav/trtc_define";

import event from '../event';

export const C2Cvideo = (props) => {
    const { trtcInstance, isVideoCall } = props;
    const selfViewRef = useRef(null);
    const remoteViewRef = useRef(null);

    useEffect(() => {
        event.on('toggleVideo', onVideoChanged);
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
    }, []);

    
    const onVideoChanged = (shouldShow) => {
        selfViewRef.current.style.display = shouldShow ? 'block' : 'none';
    }

    const onEnterRoom = (result) => {
        if (result > 0) {
            isVideoCall && startLocalVideoPreview();
            trtcInstance.startLocalAudio();
            onVideoChanged(true)
        }
    };

    const startLocalVideoPreview = () => {
        const params = new TRTCRenderParams(TRTCVideoRotation.TRTCVideoRotation0, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
        trtcInstance.startLocalPreview(selfViewRef.current);
        trtcInstance.setLocalRenderParams(params);
        trtcInstance.muteLocalVideo(false);
    }

    const onUserVideoAvailable = (uid, available) => {
        if (available === 1) {
            trtcInstance.startRemoteView(uid, remoteViewRef.current);
            trtcInstance.setRemoteViewFillMode(uid, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
        } else {
            remoteViewRef.current.getElementsByTagName('canvas')[0].style.display = 'none';
        }
    };

    return (
        <div className="c2c-content">
            {
                isVideoCall ? (
                    <React.Fragment>
                        <div className="c2c-content--self" ref={selfViewRef} />
                        <div className="c2c-content--remote" ref={remoteViewRef} />
                    </React.Fragment>
                ) : <div className="c2c-content--voice-call">正在通话中...</div>
            }
        </div>
    )
}