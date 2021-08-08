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
        callType: '',
        windowType: 'callWindow',
        roomId: 0,
        inviteID: '',
        userID:'',
        inviteList: [],
    });

    useEffect(() => {
        eventEmiter.on('getData', (data) => {
            const { convInfo, convId, callType, windowType, roomId, inviteID,userID,inviteList } = data;
            setData({
                windowType,
                callType,
                convInfo: {
                    faceUrl: convInfo.faceUrl,
                    nickName: convInfo.nickName,
                    convType: convInfo.convType
                },
                convId: convId,
                roomId: roomId,
                inviteID: inviteID,
                userID: userID,
                inviteList: inviteList
            })
        });

        eventEmiter.on('changeWindowType', type => {
            setData(data => ({
                ...data,
                windowType: type,
            }))
        })
    }, []);

    return data;
}