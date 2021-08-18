export  interface   GroupInfoCustemString  {
    group_info_custom_string_info_key:string,
    group_info_custom_string_info_value:string
}

export type groupBaseInfoSelfInfo = {
    group_self_info_join_time?: number,
     group_self_info_msg_flag?: number, 
     group_self_info_role?: null, 
     group_self_info_unread_num?: number
}

export type  groupProfile = {
    group_detial_info_add_option?: number
    group_detial_info_create_time?: number
    group_detial_info_custom_info?: Array<GroupInfoCustemString>
    group_detial_info_face_url?: string
    group_detial_info_group_id?: string
    group_detial_info_group_name?: string
    group_detial_info_group_type?: number
    group_detial_info_info_seq?: number
    group_detial_info_introduction?: string
    group_detial_info_is_shutup_all?: boolean
    group_detial_info_last_info_time?: number
    group_detial_info_last_msg_time?: number
    group_detial_info_max_member_num?: number
    group_detial_info_member_num?: number
    group_detial_info_next_msg_seq?: number
    group_detial_info_notification?: string
    group_detial_info_online_member_num?: number
    group_detial_info_owener_identifier?: string
    group_detial_info_searchable?: boolean
    group_detial_info_visible?: boolean
    group_base_info_face_url?: number
    group_base_info_group_id?: string
    group_base_info_group_name?: string
    group_base_info_group_type?: number
    group_base_info_info_seq?: number
    group_base_info_is_shutup_all?: number
    group_base_info_lastest_seq?: number
    group_base_info_msg_flag?: number
    group_base_info_readed_seq?: number
    group_base_info_self_info?: groupBaseInfoSelfInfo
}


export  enum   GroupRermission{
    "仅管理员可修改",
    "所有人可修改"
}


export  enum   GroupInvitation{
    "仅管理员可邀请",
    "所有人可邀请",
    "不可邀请"
}
