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
        callType: ''
    });

    useEffect(() => {
        eventEmiter.on('getData', (data) => {
            const { convInfo, convId, callType } = data;
            setData({
                callType,
                convInfo: {
                    faceUrl: encodeURIComponent(convInfo.faceUrl),
                    nickName: encodeURIComponent(convInfo.nickName),
                    convType: convInfo.convType
                },
                userId: decodeURIComponent(convId)
            })
        })
    }, []);

    return data;
}