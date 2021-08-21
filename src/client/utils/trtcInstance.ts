import TRTCCloud from 'trtc-electron-sdk';
import getHuaRunConfig from '../constants/index'
const { TRTC_BASE_URL, SERVERr_ADDRESS_IP} = getHuaRunConfig
let trtcInstance: TRTCCloud = null;

const getInstance = (): TRTCCloud => {
    if (!trtcInstance) {
        trtcInstance = new TRTCCloud();
        // etc, 示例 config
        let envConfig = {};
        envConfig['trtc_env'] = { 
          'access_ip': [],
          'anycast_domain': '',
          'access_host': SERVERr_ADDRESS_IP,
          'access_public_key': '035D3DD10EAFE2E68942158562BB3C4266B7DCA2D3ACD7407184CE4E5F633DAFA4'
        }
        envConfig['proxy_env'] = { "sdk_appid": 1400529075, "domain":  TRTC_BASE_URL} 
        
        trtcInstance = new TRTCCloud();
        // etc, 示例 config
        trtcInstance.setEnvironment(JSON.stringify(envConfig))
    }
    return trtcInstance;
}

export default getInstance();
