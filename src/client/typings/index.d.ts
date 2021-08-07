declare namespace State {
    export type RootState = {
        login: {
            isLogin: boolean;
        },
        userInfo: userInfo,
        conversation: conversation,
        historyMessage: historyMessage,
        ui: ui
        groupDrawer: GroupDrawer,
    }
    export type GroupDrawer = {
        toolsDrawerVisible: boolean;
        toolsTab: 'setting' | 'announcement';
    }
    export type functionTab = 'message' | 'relationship'
    export type ui = {
        function_tab: functionTab,
        replace_router: boolean,
        callingStatus: {
            callingType: number,
            callingId: string
        }
    }
    export type historyMessage = {
        historyMessageList:Map<string, Array<message>>
        uploadProgressList:Map<string, any>
        currentReplyUser: userProfile
    }
    export type conversation = {
        unreadCount: number,
        conversationList: Array<conversationItem>,
        currentSelectedConversation: conversationItem
    }
    export type messageElemTypeText  = {
        elem_type: number
        text_elem_content: number
    }
    export type message = {
        message_client_time: number
        message_cloud_custom_str: string
        message_conv_id: string
        message_conv_type: number
        message_custom_int: number
        message_custom_str: string
        message_elem_array: Array<messageElemTypeText | any>
        message_is_excluded_from_unread_count: boolean
        message_is_from_self: boolean
        message_is_online_msg: boolean
        message_is_peer_read: boolean
        message_is_read: boolean
        message_msg_id: string
        message_platform: number
        message_priority: number
        message_rand: number
        message_sender: string
        message_sender_profile: userProfile
        message_seq: number
        message_server_time: number
        message_status: number
        message_unique_id: number
        isTimeDivider?: boolean
        time?: number
    }
    export type userProfileCustom  = {
        user_profile_custom_string_info_key: string
        user_profile_custom_string_info_value: string
    }
    export type userProfile = {
        user_profile_add_permission: number
        user_profile_birthday: number
        user_profile_custom_string_array: Array<userProfileCustom>
        user_profile_face_url: string
        user_profile_gender: number
        user_profile_identifier: string
        user_profile_language: number
        user_profile_level: number
        user_profile_location: string
        user_profile_nick_name: string
        user_profile_role: number
        user_profile_self_signature: string
    }
    export type groupProfileCunstom = {
        group_info_custom_string_info_key: string
        group_info_custom_string_info_value: string
    }
    export type  groupProfile = {
        group_detial_info_add_option?: number
        group_detial_info_create_time?: number
        group_detial_info_custom_info?: Array<groupProfileCunstom>
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
    export type groupBaseInfoSelfInfo = {
        group_self_info_join_time?: number,
         group_self_info_msg_flag?: number, 
         group_self_info_role?: null, 
         group_self_info_unread_num?: number
    }
    export type conversationItem =  {
        conv_active_time: number
        conv_id: string
        conv_is_has_draft: boolean
        conv_is_has_lastmsg: boolean
        conv_is_pinned: boolean
        conv_last_msg?: message
        conv_profile: groupProfile & userProfile
        conv_recv_opt: number
        conv_type: number
        conv_unread_num: number,
        conv_group_at_info_array: Array<any>
    }

    export type MessageReceipt = {
        msg_receipt_conv_id: string,
        msg_receipt_conv_id: number,
        msg_receipt_conv_id: string
    }
    
    export type userInfo = {
        userId: string,
        faceUrl?: string,
        nickName?: string,
        role?: number
    }

    export type actcionType<T> = {
        type: string;
        payload: T;
    }

    export type FriendProfile = {
        friend_profile_identifier: string,
        friend_profile_group_name_array: string[],
        friend_profile_remark: string,
        friend_profile_add_wording: string,
        friend_profile_add_source: string,
        friend_profile_add_time: number,
        friend_profile_user_profile: UserProfile,
        friend_profile_custom_string_array: FriendProfileCustemStringInfo[],
    }

    export type FriendProfileCustemStringInfo  = {
        friend_profile_custom_string_info_key: string
        friend_profile_custom_string_info_value: string
    }

   
}