import React from 'react';
import { useCallData } from './useCallData';
import { CallContent } from './callContent/CallContent';
import { Notification } from './notification/index';

export const Call = () => {
    const { windowType, userId, convInfo } = useCallData();
    const isCallWindow = windowType === 'callWindow';

    return (
        <div>
            {
                isCallWindow ? <CallContent userId={userId} convInfo={convInfo} /> : <Notification convInfo={convInfo} />
            }
        </div>
    )
};