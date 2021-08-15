import React, { useEffect, useRef, useState } from 'react';
import { CallAvatar } from '../../../components/callAvatar';
import {
    TRTCVideoFillMode,
    TRTCVideoRotation,
    TRTCRenderParams,
} from "trtc-electron-sdk/liteav/trtc_define";

import event from '../event';

export const C2Cvideo = (props) => {
    const { trtcInstance, isVideoCall, convInfo: { nickName, faceUrl} } = props;
    const [ isUserEntering, setIsUserEntering ] = useState(false);
    const selfViewRef = useRef(null);
    const remoteViewRef = useRef(null);

    useEffect(() => {
        event.on('toggleVideo', onVideoChanged);
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
        trtcInstance.on('onRemoteUserEnterRoom', onRemoteUserEnterRoom);
    }, []);

    
    const onVideoChanged = (shouldShow) => selfViewRef.current.style.display = shouldShow ? 'block' : 'none';

    const onRemoteUserEnterRoom = () => setIsUserEntering(true);

    const onEnterRoom = (result) => {
        if (result > 0) {
            trtcInstance.startLocalAudio();
            isVideoCall && startLocalVideoPreview();
            isVideoCall && onVideoChanged(true)
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
            isVideoCall && (remoteViewRef.current.getElementsByTagName('div')[0].style.display = 'none');
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
                ) : <div className="c2c-content--voice-call">
                    <CallAvatar url={faceUrl} nickName={nickName} key={faceUrl} size={"large"}/>
                    <span className="c2c-content--voice-call__nick-name">{nickName}</span>
                    <span className="c2c-content--voice-call__text"> {isUserEntering ? '正在通话中...' : '等待对方加入...'}</span>
                </div>
            }
        </div>
    )
}