import timRenderInstance from "../../../utils/timRenderInstance";

export type GroupList = {
  group_base_info_face_url: string;
  group_base_info_group_id: string;
  group_base_info_group_name: string;
  group_detial_info_owener_identifier: string;
  group_base_info_group_type: number;
}[];

export interface createGroupMemberParams {
  group_member_info_member_role: number;
  group_member_info_identifier: number & string
}

export interface createGroupParams {
  groupName: string;
  groupIntroduction?: string;
  groupAnnouncement?: string;
  groupInvitation?:string;
  groupPression?:string | number; 
  joinGroupMode?: string;
  groupMember?: Array<createGroupMemberParams>;
  groupType: string;
  groupAvatarUrl: string;
}

export const getJoinedGroupList = async (): Promise<GroupList> => {
  const { data } = await timRenderInstance.TIMGroupGetJoinedGroupList();
  const { code, json_param } = data;
  if (code === 0) return JSON.parse(json_param);
  return [];
};

export const deleteGroup = async (groupId: string): Promise<any> => {
  const { data } = await timRenderInstance.TIMGroupDelete({ groupId });
  console.log("data", data);
  const { code, desc } = data;
  if (code === 0) {
    return {};
  }
  throw new Error(desc);
};

export const quitGroup = async (groupId: string): Promise<any> => {
  const { data } = await timRenderInstance.TIMGroupQuit({ groupId });
  const { code, desc } = data;
  if (code === 0) {
    return {};
  }
  throw new Error(desc);
};

export const createGroup = async (params: createGroupParams): Promise<any> => {
  const {
    groupName,
    groupMember,
    groupIntroduction,
    groupAnnouncement,
    groupType,
    groupPression,
    groupInvitation,
    joinGroupMode,
    groupAvatarUrl
  } = params;
  const createParams = {
    create_group_param_add_option: Number(joinGroupMode),
    create_group_param_group_name: groupName,
    create_group_param_group_type: Number(groupType),
    create_group_param_custom_info:[{
      group_info_custom_string_info_key:"group_permission",
      group_info_custom_string_info_value:groupPression
    },{
      group_info_custom_string_info_key:"group_invitation",
      group_info_custom_string_info_value:groupPression
    }],
    create_group_param_face_url: groupAvatarUrl,
    ...(groupMember && groupMember.length && { create_group_param_group_member_array: groupMember}),
    ...(groupIntroduction && {create_group_param_introduction: groupIntroduction}),
    ...(groupAnnouncement && {create_group_param_notification: groupAnnouncement})
  };
  console.log('创建群参数',createParams )
  const { data } = await timRenderInstance.TIMGroupCreate({
    params: createParams,
  });

  console.log('data', data)
  const { code, desc, json_param } = data;
  if (code === 0) {
    return {json_param};
  }
  throw new Error(desc);
};
