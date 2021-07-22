import request from '../utils/request'
import { HUA_RUN_LOGIN_TEST, HUA_RUN_SYSTEMID } from '../constants/index'


export async function getUserLoginInfo<T>(data: T): Promise<any> {
    return request({
        url: HUA_RUN_LOGIN_TEST,
        method: 'GET',
        params: data
    })
}
