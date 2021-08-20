export const GET_SECTION_COUNT = 'GET_SECTION_COUNT';
export const GET_My_GROUP_INFORMATION = 'GET_My_GROUP_INFORMATION';
export const GET_INIT_GROUP_INFO = 'GET_INIT_GROUP_INFO';

type CallingPayload = {
    group_member_info_custom_info: Array<object>,
    group_member_info_face_url: string,
    group_member_info_group_id: string,
    group_member_info_identifier:string,
    group_member_info_member_role:number,
    group_member_info_msg_seq:number,
    group_member_info_msg_flag:number,
    group_member_info_name_card:"",
    group_member_info_nick_name:string,
    group_member_info_remark:number,
    group_member_info_shutup_time:number,
    
}

export const setUnreadCount = (payload: Array<Object>) : State.actcionType<Array<Object>> => ({
    type: GET_SECTION_COUNT,
    payload
})


export const setMyGroupInformation = (payload: CallingPayload) : State.actcionType<CallingPayload> => ({
    type: GET_My_GROUP_INFORMATION,
    payload
})


export const initGroupInfor = (payload: number) : State.actcionType<number> => ({
    type: GET_INIT_GROUP_INFO,
    payload
})