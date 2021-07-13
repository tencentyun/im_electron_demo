import timRenderInstance from "../../utils/timRenderInstance";

type SendMsgParams<T> = {
  convId: string;
  convType: number;
  messageElementArray: [T];
  userData?: string;
  userId: string;
};

type TextMsg = {
  elem_type: number;
  text_elem_content: string;
};

type ImageMsg = {
    elem_type: number,
    image_elem_orig_path: string,
    image_elem_level: number
}

type FileMsg = {
    elem_type: number,
    file_elem_file_path: string,
    file_elem_file_name: string,
    file_elem_file_size: number
}

type SoundMsg = {
    elem_type: number,
    sound_elem_file_path: string,
    sound_elem_file_size: number,
    sound_elem_file_time: number
}

type VideoMsg = {
    elem_type: number,
    video_elem_video_type: string,
    video_elem_video_size: number,
    video_elem_video_duration: number,
    video_elem_video_path: string
}

type FaceMsg = {
  elem_type: number;
  face_elem_index: number;
  face_elem_buf: string;
};

type MsgResponse = {
  data: {
    code: number;
    desc: string;
    json_params: string;
    user_data: string;
  };
};

const getUserInfoList = async (userIdList: Array<string>) => {
  const {
    data: { code, json_param },
  } = await timRenderInstance.TIMProfileGetUserProfileList({
    json_get_user_profile_list_param: {
      friendship_getprofilelist_param_identifier_array: userIdList,
    },
  });
  console.log("userListInfo", JSON.parse(json_param));
  return JSON.parse(json_param);
};

const getGroupInfoList = async (groupIdList: Array<string>) => {
  const {
    data: { code, json_param },
  } = await timRenderInstance.TIMGroupGetGroupInfoList({
    groupIds: groupIdList,
  });
  const groupInfoList = JSON.parse(json_param);
  console.log("groupInfo", groupInfoList);

  return groupInfoList.map((item) => item.get_groups_info_result_info);
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
      conv_profile: profile,
    };
  });
};

export const getMsgList = async (convId, convType) => {
  const {
    data: { json_params },
  } = await timRenderInstance.TIMMsgGetMsgList({
    conv_id: convId,
    conv_type: convType,
    params: {
      msg_getmsglist_param_last_msg: null,
      msg_getmsglist_param_count: 100,
    },
    user_data: "123",
  });

  return JSON.parse(json_params);
};

export const markMessageAsRead = async (
  conv_id,
  conv_type,
  last_message_id
) => {
  const {
    data: { code, json_params, desc },
  } = await timRenderInstance.TIMMsgReportReaded({
    conv_type: conv_type,
    conv_id: conv_id,
    message_id: last_message_id,
  });
  return { code, desc, json_params };
};

const sendMsg = async ({
    convId,
    convType,
    messageElementArray,
    userData,
    userId
} : SendMsgParams<TextMsg | FaceMsg | FileMsg | ImageMsg | SoundMsg | VideoMsg>): Promise<MsgResponse> => {
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
export const sendImageMsg = (params: SendMsgParams<ImageMsg>): Promise<MsgResponse> => sendMsg(params);
export const sendFileMsg = (params: SendMsgParams<FileMsg>): Promise<MsgResponse> => sendMsg(params);
export const sendSoundMsg = (params: SendMsgParams<SoundMsg>): Promise<MsgResponse> => sendMsg(params);
export const sendVideoMsg = (params: SendMsgParams<VideoMsg>): Promise<MsgResponse> => sendMsg(params);
// export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);
// export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);
// export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);
// export const sendTextMsg = (params: SendMsgParams<TextMsg>): Promise<MsgResponse> => sendMsg(params);

export const getConversionList = async () => {
  const {
    data: { json_param },
  } = await timRenderInstance.TIMConvGetConvList({});
  const conversitionList = JSON.parse(json_param);
  const hasLastMessageList = conversitionList.filter(
    (item) => item.conv_is_has_lastmsg && item.conv_type != 0
  );
  const conversitionListProfile = addProfileForConversition(hasLastMessageList);

  return conversitionListProfile;
};

export const revokeMsg = async ({
    convId,
    convType,
    msgId
}) => {
    const res = await timRenderInstance.TIMMsgRevoke({
        conv_id: convId,
        conv_type: convType,
        message_id: msgId,
    });

    console.log(res);
}

export const inviteMemberGroup = async (params: {
  UID: string;
  groupId: string;
}):Promise<any> => {
  const { UID, groupId } = params;
  const inviteParams = {
    group_invite_member_param_group_id: groupId,
    group_invite_member_param_identifier_array: [UID],
  };
  const { data } = await timRenderInstance.TIMGroupInviteMember({params: inviteParams});
  console.log('inviteMemberGroup', data)
  const { code, desc } = data;
  if (code === 0) {
    return {};
  }
  throw new Error(desc);
};
