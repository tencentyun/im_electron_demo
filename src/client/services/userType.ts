import  request from '../utils/request'
import { SDKAPPID, TIM_BASE_URL } from '../constants/index'

export type userTypeUpsertParams = {
    uid: string; // 当前用户id
    To_Account: Array<string>; // 操作类型 1添加，2删除
}
/**
 * 获取用户当前是否在线的状态
 */
export async function getUserTypeQuery(data: userTypeUpsertParams): Promise<any> {
    return request({
        url: `/status/get?platform=10&websdkappid=537048168&v=1.7.3&sdkappid=${SDKAPPID}&contentType=json&apn=1&reqtime=${Date.now()}`,
        method: 'POST',
        data: {
            sdkappid: SDKAPPID,
            ...data
        },
        headers: {
            'Content-Type' : 'application/json; charset=utf-8'
        }
    })
}