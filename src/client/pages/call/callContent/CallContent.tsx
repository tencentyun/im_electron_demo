import React, { useState, useEffect, useRef, useCallback } from 'react';
import { remote } from 'electron';
import {
    TRTCAppScene, 
    TRTCParams, 
    TRTCVideoEncParam,
    TRTCVideoResolution,
    TRTCVideoResolutionMode,
} from "trtc-electron-sdk/liteav/trtc_define";

import trtcInstance from '../../../utils/trtcInstance';
import { CallVideo } from '../callVideo/CallVideo';
import CallFooter from '../callFooter/CallFooter';
import { CallTime } from './CallTime';
import { eventListiner } from '../callIpc';

import event from '../event';

import './call-content.scss';

let realCallTime = 0;
let isClosedWindow = false;

export const CallContent = ({ userId, convInfo, roomId, inviteID, inviteList, userSig, sdkAppid, callType, inviteListWithInfo }) => {
    console.log('==============call window params=================', roomId, inviteID, inviteList, sdkAppid, userSig, callType, inviteListWithInfo);
    const [ isStart, setStartStatus ] = useState(false);
    const convType = convInfo.convType;
    const isC2CCall = convType === 1; // 1: c2c, 2: 群聊
    const isVideoCall = callType === 2; // 1: 语音通话, 2: 视频通话

    const onExitRoom = () => {
        const win = remote.getCurrentWindow();
        win.close();
        isClosedWindow = true;
    }

    const setRealCallTime = useCallback((time) => {
        realCallTime = time;
    }, [])

    const onRemoteUserEnterRoom = userId => {
        eventListiner.remoteUserJoin(userId);
        setStartStatus(true);
    }

    const startVideo = () => {
        trtcInstance.on('onExitRoom', onExitRoom);
        trtcInstance.on('onRemoteUserEnterRoom', onRemoteUserEnterRoom);
        trtcInstance.on('onRemoteUserLeaveRoom', onRemoteUserLeaveRoom);
        isVideoCall && setVideoParams(); 
        enterRoom();
    }

    const setVideoParams = () => {
        const currentCamera = trtcInstance.getCurrentCameraDevice();
        const { deviceId } = currentCamera;
        trtcInstance.setCurrentCameraDevice(deviceId);

        let encParam = new TRTCVideoEncParam();
        encParam.videoResolution = TRTCVideoResolution.TRTCVideoResolution_640_360;
        encParam.resMode = TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape;
        encParam.videoFps = 25;
        encParam.videoBitrate = 600;
        encParam.enableAdjustRes = true;
        trtcInstance.setVideoEncoderParam(encParam);
    }

    const enterRoom = () => {
        let param = new TRTCParams();
        param.sdkAppId = sdkAppid;
        param.userSig = userSig;
        param.roomId = Number(roomId);
        param.userId = userId;
        trtcInstance.enterRoom(param, TRTCAppScene.TRTCAppSceneVideoCall);
    }

    useEffect(() => {
        if(userId) {
            startVideo();
        }
    }, [userId]);

    useEffect(() => {
        event.on('exitRoom', exitRoom);
    }, []);

    const onRemoteUserLeaveRoom = (userId) => {
        eventListiner.remoteUserExit(userId);
        // isC2CCall && trtcInstance.exitRoom();
    };

    const toggleVideo = isOpenCamera => {
        trtcInstance.muteLocalVideo(isOpenCamera);
        event.emit('toggleVideo', !isOpenCamera);
    };

    const toggleVoice = isMute => {
        event.emit('toggleVoice', !isMute);
        trtcInstance.muteLocalAudio(isMute);
    }

    const exitRoom = () => {
        eventListiner.cancelCall(inviteID, realCallTime);
        trtcInstance.exitRoom();
        setTimeout(() => {
            if(!isClosedWindow) {
                onExitRoom();
            }
        }, 3000)
    }
     
    return <div className="call-content">
       <header className="call-content__header">
           <CallTime setRealCallTime={setRealCallTime} isStart={isStart} prefix={"通话时间: "} />
       </header>
       <section className="call-content__video" >
            <CallVideo trtcInstance={trtcInstance} isVideoCall={isVideoCall}  inviteListWithInfo={inviteListWithInfo} convInfo={convInfo} userId={userId} inviteList={inviteList} />
       </section>
       <footer className="call-content__footer">
            <CallFooter isVideoCall={isVideoCall} toggleVideo={toggleVideo} toggleVoice={toggleVoice} exitRoom={exitRoom} />
       </footer>
    </div>
};