import  request from '../utils/request'
import { SDK_APPID, TIM_BASE_URL } from '../constants/index'

export type userTypeUpsertParams = {
    uid?: string; // 当前用户id
    To_Account: Array<string>; // 操作类型 1添加，2删除
}
/**
 * 获取用户当前是否在线的状态
 */
export async function getUserTypeQuery(data: userTypeUpsertParams): Promise<any> {
    return request({
        url: `${TIM_BASE_URL}/status/get`,
        method: 'POST',
        data: {
            skdappid: SDK_APPID,
            ...data
        }
    })
}