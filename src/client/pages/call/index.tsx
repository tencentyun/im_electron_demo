import React from 'react';
import { useCallData } from './useCallData';
import { CallContent } from './callContent/CallContent';
import { Notification } from './notification/index';

export const Call = () => {
    const { windowType, userId, convInfo, roomId, callType, inviteID } = useCallData();
    const isCallWindow = windowType === 'callWindow';
    if(roomId === 0){
        // TODO loading
        return null
    }
    return (
        <div>
            {
                isCallWindow ? <CallContent userId={'3708'} convInfo={convInfo} roomId={roomId}  inviteID={inviteID}/> : <Notification convInfo={convInfo} callType={callType} inviteID={inviteID} />
            }
        </div>
    )
};