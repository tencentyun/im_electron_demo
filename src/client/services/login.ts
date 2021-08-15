import request from '../utils/request'
import getHuaRunConfig from '../constants/index'


export async function getUserLoginInfo<T>(data: T): Promise<any> {
    return request({
        url: getHuaRunConfig.HUA_RUN_LOGIN_TEST,
        method: 'GET',
        params: data
    })
}
