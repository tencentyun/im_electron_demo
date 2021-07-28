import React, { useState } from 'react';

import './call-footer.scss';

type Props = {
    toggleVoice: (mute: boolean) => void,
    toggleVideo: (mute: boolean) => void,
    exitRoom: () => void
}

export const CallFooter = (props: Props) => {
    const { toggleVoice, toggleVideo, exitRoom } = props;
    const [isMute, setMute] = useState(true);
    const [isOpenCamera, setOpenCamera ] = useState(false);

    const handleToggleVideo = () => {
        toggleVideo(isOpenCamera);
        setOpenCamera(!isOpenCamera);
    };

    const handleToggleVoice = () => {
        toggleVoice(!isMute);
        setMute(!isMute);
    };

    return (
        <div className="call-footer">
            <div className="call-footer__control-btn">
                <span className="voice" onClick={handleToggleVoice}></span>
                <span className="video" onClick={handleToggleVideo}></span>
            </div>
            <div className="call-footer__end-btn">
                <button onClick={exitRoom}>挂断</button>
            </div>
        </div>
    )
};