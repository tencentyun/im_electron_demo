import timRenderInstance from '../../utils/timRenderInstance';

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
    const { userIds, groupIds} = getIds(conversitionList);
    const userInfoList = await getUserInfoList(userIds);
    const groupInfoList = await getGroupInfoList(groupIds);

    return conversitionList.map(item => {
        const {conv_type, conv_id } = item;
        let profile;
        if(conv_type === 2) {
            profile = groupInfoList.find(group => {
                const { group_detial_info_group_id} = group;
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

export const getConversionList = async () => {
    const { data: { json_param } } = await timRenderInstance.TIMConvGetConvList({ userData: '' });
    const conversitionList = JSON.parse(json_param);
    const hasLastMessageList = conversitionList.filter(item => item.conv_is_has_lastmsg);
    const conversitionListProfile = addProfileForConversition(hasLastMessageList);

    return conversitionListProfile;
}

