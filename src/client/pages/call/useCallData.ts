import { useEffect, useState } from 'react';

import eventEmiter from './event';

export const useCallData = () => {
    const [data, setData] = useState({
        convInfo: {
            faceUrl: '',
            nickName: '',
            convType: 0
        },
        userId: '',
        callType: '',
        windowType: 'callWindow',
        roomId: 0,
        inviteID: '',
        inviteList: [],
    });

    useEffect(() => {
        eventEmiter.on('getData', (data) => {
            const { convInfo, convId, callType, windowType, roomId, inviteID, inviteList } = data;
            setData({
                windowType,
                callType,
                convInfo: {
                    faceUrl: convInfo.faceUrl,
                    nickName: convInfo.nickName,
                    convType: convInfo.convType
                },
                userId: convId,
                roomId: roomId,
                inviteID: inviteID,
                inviteList: JSON.parse(decodeURIComponent(inviteList))
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