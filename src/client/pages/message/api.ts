import timRenderInstance from '../../utils/timRenderInstance';

type SendMsgParams<T> = {
    convId: string,
    convType: number,
    messageElementArray: [T]
    userData?: string
    userId: string
}

type TextMsg = {
    elem_type: number,
    text_elem_content: string,
}

type FaceMsg = {
    elem_type: number,
    face_elem_index: number,
    face_elem_buf: string,
}

type MsgResponse = {
    data: {
        code: number,
        desc: string,
        json_params: string,
        user_data: string,
    }
}


const getUserInfoList = async (userIdList: Array<string>) => {
    const { data: { code, json_param } } = await timRenderInstance.TIMProfileGetUserProfileList({
        json_get_user_profile_list_param: {
            friendship_getprofilelist_param_identifier_array: userIdList
        },
    });
    console.log('userListInfo', JSON.parse(json_param));
    return JSON.parse(json_param);
}

const getGroupInfoList = async (groupIdList: Array<string>) => {
    const { data: { code, json_param } } = await timRenderInstance.TIMGroupGetGroupInfoList({
        groupIds: groupIdList
    });
    const groupInfoList = JSON.parse(json_param);
    console.log('groupInfo', groupInfoList);

    return groupInfoList.map(item => item.get_groups_info_result_info);
}

const getIds = conversionList => conversionList.reduce((acc, cur) => {
    if (cur.conv_type === 2) {
        return {
            ...acc,
            groupIds: [...acc.groupIds, cur.conv_id]
        }
    } else if (cur.conv_type === 1) {
        return {
            ...acc,
            userIds: [...acc.userIds, cur.conv_id]
        }
    }
    return acc;
}, { userIds: [], groupIds: [] });


const addProfileForConversition = async conversitionList => {
    const { userIds, groupIds } = getIds(conversitionList);
    const userInfoList = await getUserInfoList(userIds);
    const groupInfoList = await getGroupInfoList(groupIds);

    return conversitionList.map(item => {
        const { conv_type, conv_id } = item;
        let profile;
        if (conv_type === 2) {
            profile = groupInfoList.find(group => {
                const { group_detial_info_group_id } = group;
                return group_detial_info_group_id === conv_id;
            });
        } else if (conv_type === 1) {
            profile = userInfoList.find(user => user.user_profile_identifier === conv_id);
        }
        return {
            ...item,
            conv_profile: profile
        }
    });
}

export const getMsgList = async (convId, convType) => {
    const { data: { json_params } } = await timRenderInstance.TIMMsgGetMsgList({
        conv_id: convId,
        conv_type: convType,
        params: {
            msg_getmsglist_param_last_msg: null,
            msg_getmsglist_param_count: 100
        },
        user_data: "123"
    });

    return JSON.parse(json_params);
}



const sendMsg = async ({
    convId,
    convType,
    messageElementArray,
    userData,
    userId
} : SendMsgParams<TextMsg | FaceMsg>): Promise<MsgResponse> => {
    const res = await timRenderInstance.TIMMsgSendMessage({
        conv_id: convId,
        conv_type: convType,
        params: {
            message_elem_array: messageElementArray,
            message_sender: userId,
        },
        user_data: userData
    });
    return res;
};

export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);

export const getConversionList = async () => {
    const { data: { json_param } } = await timRenderInstance.TIMConvGetConvList({});
    const conversitionList = JSON.parse(json_param);
    const hasLastMessageList = conversitionList.filter(item => item.conv_is_has_lastmsg);
    const conversitionListProfile = addProfileForConversition(hasLastMessageList);

    return conversitionListProfile;
}

