import  request from '../utils/request'
import { SDK_APPID, SERVICES_URL } from '../constants/index'
import qs from 'qs'


export async function saveUserInfo<T>(data:T): Promise<any> {
    return request({
        url: `${SERVICES_URL}/v4/profile/portrait_set?platform=10&websdkappid=${SDK_APPID}&v=1.7.3&a2=f4dca93ebc5fb16ab614d32c207610171c879a861b61499998fa0704c9467031d16dcdbe41fe4bf215a5ebb8b845f466ae0f89bda35f9e1a7072f40f1f479cedefd33de5d7b5fdc8&tinyid=37024&sdkappid=1400187352&contentType=json&apn=1&accounttype=49297318&sdkability=2`,
        method: 'POST',
        data: qs.stringify(data)
    })
}
