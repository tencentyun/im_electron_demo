import React, { useEffect } from 'react';
import { useCallData } from './useCallData';
import { CallContent } from './callContent/CallContent';
import { Notification } from './notification/index';


export const Call = () => {
    const { windowType, userID, convInfo, roomId, callType, inviteID, inviteList } = useCallData();
    const isCallWindow = windowType === 'callWindow';

    if(roomId === 0){
        // TODO loading
        return null
    }
    return (
        <div>
            {
                isCallWindow ? <CallContent userId={userID} convInfo={convInfo} roomId={roomId}  inviteID={inviteID} inviteList={inviteList}/> : <Notification convInfo={convInfo} callType={callType} inviteID={inviteID} />
            }
        </div>
    )
};