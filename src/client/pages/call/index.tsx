import React from 'react';
import { useCallData } from './useCallData';
import { CallContent } from './callContent/CallContent';
import { Notification } from './notification/index';

export const Call = () => {
    const { windowType, userId, convInfo, roomId, callType,inviteID } = useCallData();
    const isCallWindow = windowType === 'callWindow';

    return (
        <div>
            {
                isCallWindow ? <CallContent userId={userId} convInfo={convInfo} roomId={roomId}  inviteID={inviteID}/> : <Notification convInfo={convInfo} callType={callType} inviteID={inviteID} />
            }
        </div>
    )
};