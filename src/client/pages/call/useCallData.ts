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
        userID:''
    });

    useEffect(() => {
        eventEmiter.on('getData', (data) => {
            const { convInfo, convId, callType, windowType, roomId, inviteID,userID } = data;
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
                userID: userID
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