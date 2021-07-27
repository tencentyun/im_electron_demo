import request from '../utils/request'
import { TIM_BASE_URLB, HUA_RUN_SYSTEMID } from '../constants/index'


export async function getUserLoginInfo<T>(data: T): Promise<any> {
    return request({
        url: `${TIM_BASE_URLB}/commonauthservice_crbk/ws/OIDAuthService/userLogin`,
        method: 'GET',
        params: data
    })
}
