import TRTCCloud from 'trtc-electron-sdk';

let trtcInstance: TRTCCloud = null;

const getInstance = (): TRTCCloud => {
    // if (!trtcInstance) {
    //     trtcInstance = new TRTCCloud();
    //     // etc, 示例 config
    //     // var config = { "proxy_env": { "sdk_appid": 1400529075, "domain": "https://common-proxy.rtc.tencent.com" } }
    //     // trtcInstance.setEnvironment(JSON.stringify(config))
    // }
    return trtcInstance;
}

export default getInstance();
