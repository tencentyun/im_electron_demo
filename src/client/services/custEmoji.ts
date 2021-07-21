import  request from '../utils/request'
import { SDK_APPID, SERVICES_URL } from '../constants/index'

export type custEmojiUpsertParams = {
    uid: string; // 当前用户id
    sticker_url?: string; // 自定义表情地址
    op_type: 1 | 2; // 操作类型 1添加，2删除
    id?: number; // 删除 id
}

export type getCustEmojiType = {
    uid: string; // 当前用户id
    page: number;
    limit: number;
}

export type custEmojiReponseType = {
    ErrorCode: number;
    Data: any;
}
/**
 * 添加删除自定义表情
 */
export async function custEmojiUpsert(data: custEmojiUpsertParams): Promise<any> {
    return request({
        url: `${SERVICES_URL}/sticker/upsert`,
        method: 'POST',
        data: {
            sdkappid: SDK_APPID,
            ...data
        }
    })
}

// 获取自定义表情
export async function getCustEmoji(params: getCustEmojiType): Promise<custEmojiReponseType> {
    return request({
        url: `${SERVICES_URL}/sticker/list`,
        params: {
            sdkappid: SDK_APPID,
            ...params
        }
    })
}