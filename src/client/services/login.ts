import request from '../utils/request'
import { TIM_BASE_URL, HUA_RUN_SYSTEMID } from '../constants/index'


export async function getUserLoginInfo<T>(data: T): Promise<any> {
    return request({
        url: `${TIM_BASE_URL}/commonauthservice_crbk/ws/OIDAuthService/userLogin`,
        method: 'GET',
        params: data
    })
}
