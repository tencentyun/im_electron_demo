import React, { useState, useEffect, useRef } from 'react';
import { remote } from 'electron';
import {
    TRTCAppScene, 
    TRTCVideoStreamType, 
    TRTCVideoFillMode, 
    TRTCParams, 
    TRTCVideoEncParam,
    TRTCVideoResolution,
    TRTCVideoResolutionMode,
    TRTCVideoRotation,
    TRTCRenderParams,
    Rect,
} from "trtc-electron-sdk/liteav/trtc_define";

import trtcInstance from '../../../utils/trtcInstance';
import generateTestUserSig from '../../../utils/generateUserSig';
import { CallVideo } from '../callVideo/CallVideo';
import { CallFooter } from '../callFooter/CallFooter';
import { CallTime } from './CallTime';

import event from '../event';

import './call-content.scss';

export const CallContent = ({ userId, convInfo, roomId}) => {
    const [ isStart, setStartStatus ] = useState(false);

    const onExitRoom = () => {
        const win = remote.getCurrentWindow();
        win.close();
    }

    const onRemoteUserEnterRoom = () => setStartStatus(true);

    const startVideo = (currentCamera) => {
        const { deviceId } = currentCamera;

        trtcInstance.on('onExitRoom', onExitRoom);
        trtcInstance.on('onRemoteUserEnterRoom', onRemoteUserEnterRoom);
        trtcInstance.setCurrentCameraDevice(deviceId);
        let encParam = new TRTCVideoEncParam();
        encParam.videoResolution = TRTCVideoResolution.TRTCVideoResolution_640_360;
        encParam.resMode = TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape;
        encParam.videoFps = 25;
        encParam.videoBitrate = 600;
        encParam.enableAdjustRes = true;
        trtcInstance.setVideoEncoderParam(encParam);

        const { sdkappid, userSig} = generateTestUserSig(userId);

        let param = new TRTCParams();
        param.sdkAppId = sdkappid;
        param.userSig = userSig;
        param.roomId = Number(roomId);
        param.userId = userId;

        trtcInstance.enterRoom(param, TRTCAppScene.TRTCAppSceneVideoCall);
    }

    useEffect(() => {
        if(userId) {
            const currentCamera = trtcInstance.getCurrentCameraDevice();
            startVideo(currentCamera);
        }
    }, [userId]);

    useEffect(() => {
        event.on('exitRoom', exitRoom)
    }, []);

    const toggleVideo = isOpenCamera => {
        trtcInstance.muteLocalVideo(isOpenCamera);
        event.emit('toggleVideo', !isOpenCamera);
    };

    const toggleVoice = isMute => trtcInstance.muteLocalAudio(isMute);

    const exitRoom = () => trtcInstance.exitRoom();
     
    return <div className="call-content">
       <header className="call-content__header">
           <CallTime isStart={isStart} />
       </header>
       <section className="call-content__video">
            <CallVideo trtcInstance={trtcInstance} convInfo={convInfo} userId={userId} />
       </section>
       <footer className="call-content__footer">
            <CallFooter toggleVideo={toggleVideo} toggleVoice={toggleVoice} exitRoom={exitRoom} />
       </footer>
    </div>
};