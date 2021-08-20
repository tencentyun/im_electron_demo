import React, { useEffect } from 'react';
import { remote } from 'electron';

import './notification.scss';
import { eventListiner } from '../callIpc';
import { endCallWindow } from '../../../utils/callWindowTools';
import event from '../event';
export const Notification = (props) => {
    const { convInfo: { nickName, faceUrl, convType}, callType, inviteID } = props;
    console.log('callType', callType);
    const isVoiceCall = callType === 1;

    const accept = () => eventListiner.acceptCall({inviteID, isVoiceCall: isVoiceCall && convType === 1});

    const refuse = () => eventListiner.refuseCall(inviteID);

    const getDisplayText = () => `邀请你进行${isVoiceCall ? '语音' : '视频'}通话`;

    useEffect(()=>{
        console.log('注册退出事件')
        event.on('exitRoom',()=>{
            // 如果没有接通，走这个退出逻辑
            endCallWindow();
        });

        let timer = setTimeout(() => {
            // endCallWindow();
            const win = remote.getCurrentWindow();
            win.close();
        }, 30 * 1000);

        return () => {
            clearTimeout(timer);
        }
    },[])

    return (
        <div className="notification">
            <div className="notification__title">
                <img src={faceUrl} className="notification__avatar"/>
                <span className="notification__title--nick-name">{nickName}</span><br></br>
                <span className="notification__title--text">{getDisplayText()}</span>
            </div>
            <div className="notification__btn">
                <div className="notification__btn--apply" onClick={accept}></div>
                <div className="notification__btn--refuse" onClick={refuse}></div>
            </div>
        </div>
    ) 
}