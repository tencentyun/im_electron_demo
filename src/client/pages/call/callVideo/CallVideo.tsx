import React, { useEffect, useState, useRef } from 'react';
import TRTCCloud from 'trtc-electron-sdk';

import { C2Cvideo } from './C2CVideo';
import { GroupVideo } from './GroupVideo';


import './call-video.scss';

type User = {
    id: string,
    nickName?: string,
    faceUrl?: string,
}

type Props = {
    trtcInstance: TRTCCloud,
    userId: string,
    convInfo: {
        faceUrl: string,
        nickName: string,
        convType: number
    }
}

export const CallVideo = (props: Props): JSX.Element => {
    const videoRef = useRef(null);
    const { trtcInstance, convInfo, userId } = props;
    const convType = convInfo.convType;

    const isC2CCall = convType === 1;

    return (
        <div className="call-video" ref={videoRef}>
            {
                isC2CCall ? <C2Cvideo trtcInstance={trtcInstance} /> : <GroupVideo />
            }
        </div>
    )
};