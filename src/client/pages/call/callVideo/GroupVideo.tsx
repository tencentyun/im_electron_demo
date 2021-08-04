import React, { useEffect, useState } from 'react';

export const GroupVideo = (props) => {
    const { trtcInstance } = props;
    useEffect(() => {
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onRemoteUserLeaveRoom', onRemoteUserLeaveRoom);
        trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
    }, []);

    const onEnterRoom = (result) => {
        if(result > 0) {
            console.log('========enter room========', result);
        };
    };

    const onRemoteUserLeaveRoom =(userId) => {

    }

    const onUserVideoAvailable =(uid, available) => {

    }
    
    return (
        <div className="group-video-content">
            Group Video Page
        </div>
    )
};