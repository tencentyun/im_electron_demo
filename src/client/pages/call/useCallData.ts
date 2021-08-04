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
    });

    useEffect(() => {
        eventEmiter.on('getData', (data) => {
            const { convInfo, convId, callType, windowType, roomId } = data;
            setData({
                windowType,
                callType,
                convInfo: {
                    faceUrl: encodeURIComponent(convInfo.faceUrl),
                    nickName: encodeURIComponent(convInfo.nickName),
                    convType: convInfo.convType
                },
                userId: decodeURIComponent(convId),
                roomId: roomId
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