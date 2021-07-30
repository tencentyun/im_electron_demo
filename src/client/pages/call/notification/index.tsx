import React from 'react';

import './notification.scss';
import { eventListiner } from '../callIpc';

export const Notification = (props) => {
    // const { convInfo: { nickName, faceUrl} } = props;
    console.log(props);

    const accept = () => {
        eventListiner.acceptCall();
    };

    const refuse = () => {
        eventListiner.refuseCall();
    } 
    
    return (
        <div className="notification">
            <div className="notification__title">
                {/* <img src={faceUrl}></img> */}
                <span className="notification__title--nick-name">Jingfeng</span><br></br>
                <span className="notification__title--text">邀请你进行语音通话</span>
            </div>
            <div className="notification__btn">
                <button className="notification__btn--apply" onClick={accept}>接受</button>
                <button className="notification__btn--refuse" onClick={refuse}>拒绝</button>
            </div>
        </div>
    ) 
}