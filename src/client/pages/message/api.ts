import { HISTORY_MESSAGE_COUNT } from "../../constants";
import timRenderInstance from "../../utils/timRenderInstance";

type SendMsgParams<T> = {
  convId: string;
  convType: number;
  messageElementArray: [T];
  userData?: string;
  userId: string;
  messageAtArray?: string[];
};

export type TextMsg = {
  elem_type: number;
  text_elem_content: string;
};

type ImageMsg = {
  elem_type: number;
  image_elem_orig_path: string;
  image_elem_level: number;
};

type FileMsg = {
  elem_type: number;
  file_elem_file_path: string;
  file_elem_file_name: string;
  file_elem_file_size: number;
};

type SoundMsg = {
  elem_type: number;
  sound_elem_file_path: string;
  sound_elem_file_size: number;
  sound_elem_file_time: number;
};

type VideoMsg = {
  elem_type: number;
  video_elem_video_type: string;
  video_elem_video_size: number;
  video_elem_video_duration: number;
  video_elem_video_path: string;
  video_elem_image_type: string;
  video_elem_image_size: number;
  video_elem_image_width: number;
  video_elem_image_height: number;
  video_elem_image_path: string;
};

type FaceMsg = {
  elem_type: number;
  face_elem_index: number;
  face_elem_buf: string;
};

type MergeMsg = {
  elem_type: number;
  merge_elem_title: string;
  merge_elem_abstract_array: string[];
  merge_elem_compatible_text: string;
  merge_elem_message_array: any[];
};
  
type CustomMsg = {
  elem_type: number;
  custom_elem_data?:string;
  custom_elem_desc?:string;
  custom_elem_ext?:string;
  custom_elem_sound?:string;
}
type MsgResponse = {
  data: {
    code: number;
    desc: string;
    json_params: string;
    user_data: string;
  };
};

type MemberInfo = {
  group_get_memeber_info_list_result_info_array: {
    group_member_info_identifier: string;
  }[];
};

const getUserInfoList = async (userIdList: Array<string>) => {
  const {
    data: { code, json_param },
  } = await timRenderInstance.TIMProfileGetUserProfileList({
    json_get_user_profile_list_param: {
      friendship_getprofilelist_param_identifier_array: userIdList,
    },
  });
  return JSON.parse(json_param);
};

export const getLoginUserID = async () => {
  const {
    data: { code, json_param },
  } = await timRenderInstance.TIMGetLoginUserID({
    userData: "test"
  });
  const loginUserID = json_param;
  return loginUserID;
};

export const getGroupInfoList = async (groupIdList: Array<string>) => {
  const {
    data: { code, json_param },
  } = await timRenderInstance.TIMGroupGetGroupInfoList({
    groupIds: groupIdList,
  });
  const groupInfoList = JSON.parse(json_param);
  console.log('groupInfoList', groupInfoList)

  return groupInfoList.map((item) => item.get_groups_info_result_info);
};

export const getJoinGroupList = async () => {
  const {
    data: { code, json_param },
  } = await timRenderInstance.TIMGroupGetJoinedGroupList();
  const groupList = JSON.parse(json_param);

  return groupList;
};

const getIds = (conversionList) =>
  conversionList.reduce(
    (acc, cur) => {
      if (cur.conv_type === 2) {
        return {
          ...acc,
          groupIds: [...acc.groupIds, cur.conv_id],
        };
      } else if (cur.conv_type === 1) {
        return {
          ...acc,
          userIds: [...acc.userIds, cur.conv_id],
        };
      }
      return acc;
    },
    { userIds: [], groupIds: [] }
  );

export const addProfileForConversition = async (conversitionList) => {
  const { userIds, groupIds } = getIds(conversitionList);
  const userInfoList = userIds.length ? await getUserInfoList(userIds) : [];
  const groupInfoList = groupIds.length
    ? await getGroupInfoList(groupIds)
    : groupIds;

  return conversitionList.map((item) => {
    const { conv_type, conv_id } = item;
    let profile;
    if (conv_type === 2) {
      profile = groupInfoList.find((group) => {
        const { group_detial_info_group_id } = group;
        return group_detial_info_group_id === conv_id;
      });
    } else if (conv_type === 1) {
      profile = userInfoList.find(
        (user) => user.user_profile_identifier === conv_id
      );
    }
    return {
      ...item,
      conv_profile: profile || {},
    };
  });
};

/**
 * 获取当前对话标列表好友状态
 * @param sdkappid
 * @param uid
 * @param isPinned
 * @returns
 */
export const getUsetStatusRequest = async (sdkappid, uid, To_Account) => {
  return await timRenderInstance.getUsetStatusRequest({
    sdkappid,
    uid,
    To_Account
  });
};
/**
 * 会话（取消）置顶
 * @param convId
 * @param convType
 * @param isPinned
 * @returns
 */
export const TIMConvPinConversation = async (convId, convType, isPinned) => {
  console.log(isPinned,'ispinner')

  const res = await timRenderInstance.TIMConvPinConversation({
    convId,
    convType,
    isPinned,
  });
  return res;
};
/**
 * 会话删除
 * @param convId
 * @param convType
 * @returns
 */
export const TIMConvDelete = async (convId, convType) => {
  return await timRenderInstance.TIMConvDelete({
    convId,
    convType,
  });
};
/**
 * 历史消息删除
 * @param convId
 * @param convType
 * @returns
 */
export const TIMMsgClearHistoryMessage = async (conv_id, conv_type) => {
  return await timRenderInstance.TIMMsgClearHistoryMessage({
    conv_id,
    conv_type,
  });
};

/**
 * C2C消息免打扰
 * @param conv_id 
 * @param conv_type 
 * @returns 
 */
export const TIMMsgSetC2CReceiveMessageOpt = async (userid, opt) => {
  return await timRenderInstance.TIMMsgSetC2CReceiveMessageOpt({
    params:[userid],
    opt,
  });
};

/**
 * 群消息免打扰
 * @param conv_id 
 * @param conv_type 
 * @returns 
 */
export const TIMMsgSetGroupReceiveMessageOpt = async (group_id, opt) => {
  return await timRenderInstance.TIMMsgSetGroupReceiveMessageOpt({
    group_id,
    opt,
  });
};

export const getMsgList = async (convId, convType,lastMsg=null) => {
  const {
    data: { json_params },
  } = await timRenderInstance.TIMMsgGetMsgList({
    conv_id: convId,
    conv_type: convType,
    params: {
      msg_getmsglist_param_last_msg: lastMsg,
      msg_getmsglist_param_count: HISTORY_MESSAGE_COUNT,
    },
  });

  return JSON.parse(json_params);
};

export const markMessageAsRead = async (
  conv_id,
  conv_type,
  last_message_id
) => {
  const {
    data: { code, json_param, desc },
  } = await timRenderInstance.TIMMsgReportReaded({
    conv_type: conv_type,
    conv_id: conv_id,
  });
  return { code, desc, json_param };
};

export const sendMsg = async ({
  convId,
  convType,
  messageElementArray,
  userId,
  userData,
  messageAtArray,
}: SendMsgParams<
  TextMsg | FaceMsg | FileMsg | ImageMsg | SoundMsg | VideoMsg | MergeMsg | CustomMsg
>): Promise<MsgResponse> => {
  const res = await timRenderInstance.TIMMsgSendMessage({
    conv_id: convId,
    conv_type: convType,
    params: {
      message_elem_array: messageElementArray,
      message_sender: userId,
      message_group_at_user_array: messageAtArray,
    },
    user_data: userData,
  });
  return res;
};

export const sendTextMsg = (
  params: SendMsgParams<TextMsg>
): Promise<MsgResponse> => sendMsg(params);
export const sendImageMsg = (
  params: SendMsgParams<ImageMsg>
): Promise<MsgResponse> => sendMsg(params);
export const sendFileMsg = (
  params: SendMsgParams<FileMsg>
): Promise<MsgResponse> => sendMsg(params);
export const sendSoundMsg = (
  params: SendMsgParams<SoundMsg>
): Promise<MsgResponse> => sendMsg(params);
export const sendVideoMsg = (
  params: SendMsgParams<VideoMsg>
): Promise<MsgResponse> => sendMsg(params);
export const sendMergeMsg = (params: SendMsgParams<MergeMsg>): Promise<MsgResponse> => sendMsg(params);
export const sendCustomMsg = (params: SendMsgParams<CustomMsg>): Promise<MsgResponse> => sendMsg(params);
// export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);
// export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);
// export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);

export const getConversionList = async () => {
  const {
    data: { json_param },
  } = await timRenderInstance.TIMConvGetConvList({});
  const conversitionList = JSON.parse(json_param);
  const hasLastMessageList = conversitionList.filter(
    (item) => item.conv_type != 0
  );
  const conversitionListProfile = addProfileForConversition(hasLastMessageList);

  return conversitionListProfile;
};

export const revokeMsg = async ({ convId, convType, msgId }) => {
  const {
    data: { code },
  } = await timRenderInstance.TIMMsgRevoke({
    conv_id: convId,
    conv_type: convType,
    message_id: msgId,
    user_data: "123",
  });

  return code;
};

export const deleteMsg = async ({ convId, convType, msgId }) => {
  const {
    data: { code },
  } = await timRenderInstance.TIMMsgDelete({
    conv_id: convId,
    conv_type: convType,
    params: {
      msg_delete_param_msg: msgId,
      msg_delete_param_is_remble: true,
    },
    user_data: "123",
  });

  return code;
};

export const inviteMemberGroup = async (params: {
  UID: string;
  groupId: string;
}): Promise<any> => {
  const { UID, groupId } = params;
  const inviteParams = {
    group_invite_member_param_group_id: groupId,
    group_invite_member_param_identifier_array: [UID],
  };
  const { data } = await timRenderInstance.TIMGroupInviteMember({
    params: inviteParams,
  });
  console.log("inviteMemberGroup", data);
  const { code, desc } = data;
  if (code === 0) {
    return {};
  }
  throw new Error(desc);
};

export const searchTextMessage = async (params: {
  keyWords: string;
}): Promise<any> => {
  const {
    data: { json_params },
  } = await timRenderInstance.TIMMsgSearchLocalMessages({
    params: {
      msg_search_param_keyword_array: [params.keyWords],
      msg_search_param_message_type_array: [0],
    },
    user_data: "123",
  });

  return JSON.parse(json_params);
};

export const searchGroup = async (params: {
  keyWords: string;
}): Promise<any> => {
  const {
    data: { json_param },
  } = await timRenderInstance.TIMGroupSearchGroups({
    searchParams: {
      group_search_params_keyword_list: [params.keyWords],
      group_search_params_field_list: [2],
    },
  });
  console.log("searchGroup", JSON.parse(json_param || "[]"));
  return JSON.parse(json_param || "[]");
};

export const searchFriends = async (params: {
  keyWords: string;
}): Promise<any> => {
  const {
    data: { json_params },
  } = await timRenderInstance.TIMFriendshipSearchFriends({
    params: {
      friendship_search_param_keyword_list: [params.keyWords],
      friendship_search_param_search_field_list: [1, 2, 4],
    },
    user_data: "1234",
  });
  console.log("searchFriends", JSON.parse(json_params || "[]"));
  return JSON.parse(json_params || "[]");
};

export const getGroupMemberList = async (params: {
  groupId: string;
}): Promise<MemberInfo> => {
  const { groupId } = params;
  const { data } = await timRenderInstance.TIMGroupGetMemberInfoList({
    params: {
      group_get_members_info_list_param_group_id: groupId,
    },
  });
  console.log("data", data);
  const { code, json_param } = data;
  if (code === 0) {
    const result = JSON.parse(json_param);
    return result;
  }
  return [] as any;
};

export const getGroupMemberInfoList = async (params: {
  groupId: string;
}): Promise<any> => {
  const { groupId } = params;
  const res = await getGroupMemberList({ groupId });
  console.log("getGroupMemberList", res);
  const { group_get_memeber_info_list_result_info_array: memberList } = res;
  const userIdList = memberList.map((v) => v.group_member_info_identifier);
  const result = await getUserInfoList(userIdList);
  console.log("getUserInfoList", result);
  const userList = result.map((v) => {
    const member =
      memberList.find(
        (item) =>
          item.group_member_info_identifier === v.user_profile_identifier
      ) || {};
    return { ...v, ...member };
  });
  return userList;
};

const modifyFlagMap = {
  group_modify_info_param_group_name: 0x01,
  group_modify_info_param_notification: 0x01 << 1,
  group_modify_info_param_introduction: 0x01 << 2,
  group_modify_info_param_face_url: 0x01 << 3,
  group_modify_info_param_add_option: 0x01 << 4,
  group_modify_info_param_max_member_num: 0x01 << 5,
  group_modify_info_param_visible: 0x01 << 6,
  group_modify_info_param_searchable: 0x01 << 7,
  group_modify_info_param_is_shutup_all: 0x01 << 8,
  group_modify_info_param_owner: 0x01 << 31,
  group_modify_info_param_custom_info: 0x01 << 9,
};

export const modifyGroupInfo = async (params: {
  groupId: string;
  modifyParams: {
    group_modify_info_param_group_name?: number | string | boolean;
    group_modify_info_param_notification?: number | string | boolean;
    group_modify_info_param_introduction?: number | string | boolean;
    group_modify_info_param_face_url?: number | string | boolean;
    group_modify_info_param_add_option?: number | string | boolean;
    group_modify_info_param_max_member_num?: number | string | boolean;
    group_modify_info_param_visible?: number | string | boolean;
    group_modify_info_param_searchable?: number | string | boolean;
    group_modify_info_param_is_shutup_all?: number | string | boolean;
    group_modify_info_param_owner?: number | string | boolean;
    group_modify_info_param_custom_info?: number | string | boolean;
  };
}): Promise<any> => {
  const { groupId, modifyParams } = params;

  const modifyFlags = Object.keys(modifyParams).map(
    (key) => modifyFlagMap[key]
  );

  const fetchList = modifyFlags.map((currentFlag) =>
    timRenderInstance.TIMGroupModifyGroupInfo({
      params: {
        group_modify_info_param_group_id: groupId,
        group_modify_info_param_modify_flag: currentFlag,
        ...modifyParams,
      },
    })
  );

  const results = await Promise.all(fetchList);
  if (!results.find((item) => item?.data?.code !== 0)) {
    return {};
  }

  throw new Error(JSON.stringify(results));
};

const modifyGroupMemberMap = {
  group_modify_member_info_msg_flag: 0x01,
  group_modify_member_info_member_role: 0x01 << 1,
  group_modify_member_info_shutup_time: 0x01 << 2,
  group_modify_member_info_name_card: 0x01 << 3,
  group_modify_member_info_custom_info: 0x01 << 4,
};

export const modifyGroupMemberInfo = async (params: {
  groupId: string;
  userId: string;
  modifyGroupMemberParams: {
    group_modify_member_info_msg_flag?: string | number;
    group_modify_member_info_member_role?: string | number;
    group_modify_member_info_shutup_time?: string | number;
    group_modify_member_info_name_card?: string | number;
    group_modify_member_info_custom_info?: string | number;
  };
}): Promise<any> => {
  const { groupId, userId, modifyGroupMemberParams } = params;
  const modifyGroupMemberFlags = Object.keys(modifyGroupMemberParams).map(
    (key) => modifyGroupMemberMap[key]
  );

  let modifyFlag = 0;
  modifyGroupMemberFlags.forEach(
    (currentFlag) => (modifyFlag = modifyFlag | currentFlag)
  );

  const { data } = await timRenderInstance.TIMGroupModifyMemberInfo({
    params: {
      group_modify_member_info_group_id: groupId,
      group_modify_member_info_identifier: userId,
      group_modify_member_info_modify_flag: modifyFlag,
      ...modifyGroupMemberParams,
    },
  });
  const { code, desc } = data;

  console.log("data", data);
  if (code === 0) {
    return {};
  }

  throw new Error(desc);
};

export const deleteGroupMember = async (params: {
  groupId: string;
  userIdList: string[];
}): Promise<any> => {
  console.log('params', params);
  const { data } = await timRenderInstance.TIMGroupDeleteMember({
    params: {
      group_delete_member_param_group_id: params.groupId,
      group_delete_member_param_identifier_array: params.userIdList,
    }
  });
  console.log('data', data);
  const { code, desc } = data;
  if (code === 0) {
    return {};
  }
  throw new Error(desc);
};
