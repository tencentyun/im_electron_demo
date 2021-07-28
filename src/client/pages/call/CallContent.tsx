import React, { useState, useEffect, useRef } from 'react';
import { remote } from 'electron';

import trtcInstance from '../../utils/trtcInstance';
import generateTestUserSig from '../../utils/generateUserSig';
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

import './call-content.scss';
import { message } from 'tea-component';

function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

export const CallContent = () => {
    const callingTIme = '00:37';
    const videoRef = useRef(null);
    const [noVideo, setVidoe] = useState(true);

    const handleClose = () => {
        trtcInstance.exitRoom();
       
    };

    const onEnterRoom = (result => {
        if(result > 0 ) {
            setVidoe(true);
            trtcInstance.startLocalPreview(videoRef.current);
            trtcInstance.startLocalAudio();
            const params = new TRTCRenderParams(TRTCVideoRotation.TRTCVideoRotation0, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
            trtcInstance.setLocalRenderParams(params);
        }
    });

    const onExitRoom = () => {
        const win = remote.getCurrentWindow();
        win.close();
    }

    const getUserData = () => {
        try {
            const { convInfo, conv_id } = JSON.parse(getQueryString('data'));

            return {
                userId: conv_id,
                convInfo
            }
        } catch (e) {
            message.warning({ content: '获取用户信息失败'})
        }
    }

    const onRemoteUserEnterRoom = () => {
        console.log('other people join in')
    }

    const startVideo = (currentCamera) => {
        const { userId } = getUserData();
        const roomId = 123456;
        const { deviceId } = currentCamera;

        console.log('urlParams',  getQueryString('data'));

        trtcInstance.on('onEnterRoom', onEnterRoom);
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
        param.roomId = roomId;
        param.userId = userId;

        trtcInstance.enterRoom(param, TRTCAppScene.TRTCAppSceneVideoCall);
    }

    const toggleVideo = () => {
        trtcInstance.stopLocalPreview();
    }

    const toggleVoice = () => {
        trtcInstance.startLocalPreview(videoRef.current);
    }

    useEffect(() => {
        const currentCamera = trtcInstance.getCurrentCameraDevice();
        startVideo(currentCamera);
    }, []);
     
    return <div className="call-content">
       <header className="call-content__header">
           <span>通话时间: {callingTIme}</span>
       </header>
       <section className="call-content__video" ref={videoRef}>
           {
               noVideo&& <div className="call-content__video--empty" />
           }
       </section>
       <footer className="call-content__footer">
           <div className="call-content__footer-btn--control">
               <span className="voice" onClick={toggleVoice}></span>
               <span className="video" onClick={toggleVideo}></span>
           </div>
           <div className="call-content__footer-btn--end">
               <button onClick={handleClose}>挂断</button>
           </div>
       </footer>
    </div>
};