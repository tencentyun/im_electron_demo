import TRTCCloud from 'trtc-electron-sdk';
import getHuaRunConfig from '../constants/index'
const { TRTC_BASE_URL } = getHuaRunConfig
let trtcInstance: TRTCCloud = null;

const getInstance = (): TRTCCloud => {
    if (!trtcInstance) {
        trtcInstance = new TRTCCloud();
        // etc, 示例 config
        var config = { "proxy_env": { "sdk_appid": 1400529075, "domain":  TRTC_BASE_URL} }
        trtcInstance.setEnvironment(JSON.stringify(config))
    }
    return trtcInstance;
}

export default getInstance();
