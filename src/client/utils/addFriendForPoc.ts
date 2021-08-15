import getHuaRunConfig from '../../client/constants'
import request from '../../client/utils/request'
import { SDKAPPID } from '../../client/constants'
const getEncrptPwd = (data) => {
    return request({
        url: `${getHuaRunConfig.TIM_BASE_URL}/v4/encryt?platform=10&websdkappid=537048168&v=1.7.3&sdkappid=${SDKAPPID}&contentType=json&apn=1&reqtime=${Date.now()}`,
        method: 'POST',
        data: data || {}
    })
}
export {
    getEncrptPwd,

}