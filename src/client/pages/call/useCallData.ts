import { useEffect, useState } from 'react';

import eventEmiter from './event';

export const useCallData = () => {
    const [data, setData] = useState({
        convInfo: {
            faceUrl: '',
            nickName: '',
            convType: 0
        },
        convId: '',
        callType: 1,
        windowType: 'callWindow',
        roomId: 0,
        inviteID: '',
        userID:'',
        inviteList: [],
        sdkAppid: 0,
        userSig: '',
    });

    useEffect(() => {
        eventEmiter.on('getData', (data) => {
            const { convInfo, convId, callType, windowType, roomId, inviteID,userID,inviteList, sdkAppid, userSig } = data;
            setData({
                windowType,
                callType: Number(callType),
                convInfo: {
                    faceUrl: convInfo.faceUrl,
                    nickName: convInfo.nickName,
                    convType: convInfo.convType
                },
                convId: convId,
                roomId: roomId,
                inviteID: inviteID,
                userID: userID,
                inviteList: inviteList,
                sdkAppid: Number(sdkAppid) ,
                userSig: userSig,
            })
        });

        eventEmiter.on('changeWindowType', type => {
            setData(data => ({
                ...data,
                windowType: type,
            }))
        });

        eventEmiter.on('updateInviteList', inviteList => {
            setData(prev => ({...prev, inviteList }))
        });
    }, []);

    return data;
}