import { ConvItem } from "../pages/message/type"

const TEMP_PATH_NAME_GROUP = "TEMP_PATH_NAME_GROUP"
export enum TIMConvType {
    kTIMConv_Invalid, // 无效会话
    kTIMConv_C2C,     // 个人会话
    kTIMConv_Group,   // 群组会话
    kTIMConv_System,  // 系统会话
};

export const getMessageId = (message: State.message): string => {
    return message.message_msg_id
}
export const getConvId = (convItem: ConvItem): string => {
    const item = convItem as State.groupProfile
    if(item.group_detial_info_group_id) {
        return item.group_detial_info_group_id
    } else {
        return (convItem as State.FriendProfile).friend_profile_identifier
    }
}
export const getConvType = (convItem: ConvItem): TIMConvType => {
    const item = convItem as State.FriendProfile
    return (item.friend_profile_identifier || item.friend_profile_user_profile?.user_profile_identifier) ? TIMConvType.kTIMConv_C2C : TIMConvType.kTIMConv_Group
}
export const getMergeMessageTitle = (message: State.message): string => {
    const groupTitle: string = "群聊"
    const c2cTitle: string = `${message.message_sender}和${message.message_conv_id}的聊天记录`
    return message.message_conv_type === TIMConvType.kTIMConv_C2C ? c2cTitle : groupTitle
}
export const getMergeMessageAbstactArray = (messageGroup: State.message[]): string[] => {
    const ret: string[] = []
    messageGroup.forEach(message => {
        message.message_elem_array.forEach(elem => {
            const displayTextMsg = elem.text_elem_content
            const sender = message.message_sender
            const displayLastMsg = {
                '0': displayTextMsg,
                '1': '[图片]',
                '2': '[声音]',
                '3': '[自定义消息]',
                '4': '[文件消息]',
                '5': '[群组系统消息]',
                '6': '[表情消息]',
                '7': '[位置消息]',
                '8': '[群组系统通知]',
                '9': '[视频消息]',
                '10': '[关系]',
                '11': '[资料]',
                '12': '[合并消息]',
            }[elem.elem_type];
            ret.push(`${sender}: ${displayLastMsg}`)
        })
    })
    return ret;
}

/**
 * 
 * @param limitSize 所要限定的文件大小
 * @param file 文件对象
 * @returns boolean  true 符合限定的大小，反之不符合
 */
export const judgeFileSize = (limitSize: number, file: File) => {
    const { size } = file
    return limitSize >= size / 1024 / 1024
}
export const setPathToLS = (path: string): void => {
    if(!path) return
    const pathGroup: Array<string> = JSON.parse(localStorage.getItem(TEMP_PATH_NAME_GROUP) || "[]")
    if(pathGroup.indexOf(path) === -1) {
        pathGroup.push(path)
    }
    localStorage.setItem(TEMP_PATH_NAME_GROUP, JSON.stringify(pathGroup))
}
export const checkPathInLS = (path: string) => {
    const pathGroup: Array<string> = JSON.parse(localStorage.getItem(TEMP_PATH_NAME_GROUP) || "[]")
    if(pathGroup.length && pathGroup.indexOf(path) > -1) return true
    return false
}