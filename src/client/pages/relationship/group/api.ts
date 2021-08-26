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

//2021年8月24日09:57:46   zwc   申请入群
export const joinGroup = async (groupId: string): Promise<any> => {
  const { data } = await timRenderInstance.TIMGroupJoin({ groupId });
  console.log("data", data);
  const { code, desc } = data;
  if (code === 0) {
    return {};
  }
  throw new Error(desc);
};

//2021年8月24日09:57:46   zwc   群聊未决消息
export const getPendencyList = async (limited: number = 0, time:number = 0): Promise<any> => {
  const { data } = await timRenderInstance.TIMGroupGetPendencyList({ 
    "group_pendency_option_max_limited" : 0,
    "group_pendency_option_start_time" : 0
   });
  console.log("data", data);
  const { code, desc, json_param} = data;
  if (code === 0) {
    return JSON.parse(json_param);
  }
  throw new Error(desc);
};

//2021年8月24日09:57:46   zwc   未决消息已读
export const pendencyReaded = async (): Promise<any> => {
  const { data } = await timRenderInstance.TIMGroupReportPendencyReaded({
    timeStamp:parseInt(new Date().getTime() / 1000 + '')
  });
  console.log("data", data);
  const { code, desc} = data;
  if (code === 0) {
    return {};
  }
  throw new Error(desc);
};

//2021年8月24日09:57:46   zwc   处理群未决消息
export const handleGroupPendency = async (accept: boolean = false, msg:string = "", groupPendency): Promise<any> => {
  const { data } = await timRenderInstance.TIMGroupHandlePendency({
    params:{ 
      "group_handle_pendency_param_is_accept" : accept,
      "group_handle_pendency_param_handle_msg" : msg,
      "group_handle_pendency_param_pendency" : groupPendency
     }
  });
  console.log("data", data);
  const { code, desc, json_param} = data;
  if (code === 0) {
    return json_param;
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
      group_info_custom_string_info_value:groupInvitation
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
