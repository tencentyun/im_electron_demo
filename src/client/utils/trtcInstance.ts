import TRTCCloud from 'trtc-electron-sdk';

let trtcInstance:TRTCCloud = null;

const getInstance = ():TRTCCloud => {
    if(!trtcInstance) {
        trtcInstance = new TRTCCloud();
    }
    return trtcInstance;
}

export default getInstance();
 