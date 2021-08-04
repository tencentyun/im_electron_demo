import React from 'react';

import './notification.scss';
import { eventListiner } from '../callIpc';

export const Notification = (props) => {
    const { convInfo: { nickName, faceUrl}, callType } = props;
    console.log(props);

    const accept = () => {
        eventListiner.acceptCall();
    };

    const refuse = () => {
        eventListiner.refuseCall();
    }

    const getDisplayText = () => {
        const typeText = callType === 1 ? '语音' : '视频';

        return `邀请你进行${typeText}通话`;
    }
    
    return (
        <div className="notification">
            <div className="notification__title">
                <img src={faceUrl} />
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