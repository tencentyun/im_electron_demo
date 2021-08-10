import React, { useState } from 'react';

import './call-footer.scss';

type Props = {
    toggleVoice: (mute: boolean) => void,
    toggleVideo: (mute: boolean) => void,
    exitRoom: () => void,
    isVideoCall: boolean
}

const CallFooter = (props: Props) : JSX.Element => {
    console.log('============render call footer==========');
    const { toggleVoice, toggleVideo, exitRoom, isVideoCall } = props;
    const [isOpenMic, setMute] = useState<boolean>(true);
    const [isOpenCamera, setOpenCamera ] = useState<boolean>(true);

    const handleToggleVideo = () => {
        toggleVideo(isOpenCamera);
        setOpenCamera(!isOpenCamera);
    };

    const handleToggleVoice = () => {
        toggleVoice(isOpenMic);
        setMute(!isOpenMic);
    };

    return (
        <div className="call-footer">
            <div className="call-footer__control-btn">
                <span className={`voice ${isOpenMic ? 'is-active' : '' }`} onClick={handleToggleVoice}></span>
                {
                    isVideoCall && <span className={`video ${!isOpenCamera ? 'is-active' : '' }`} onClick={handleToggleVideo}></span>
                }
            </div>
            <div className="call-footer__end-btn">
                <button onClick={exitRoom}>挂断</button>
            </div>
        </div>
    )
};

const shouldRender = (prevProps, nextProps) => {
    return prevProps.isStart === nextProps.isStart;
}

export default React.memo(CallFooter, shouldRender);