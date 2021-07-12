import timRenderInstance from "../../../utils/timRenderInstance";

export type GroupList = {
  group_base_info_face_url: string;
  group_base_info_group_id: string;
  group_base_info_group_name: string;
  group_detial_info_owener_identifier: string;
}[];

export const getJoinedGroupList = async (): Promise<GroupList> => {
  console.log('getJoinedGroupList')
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
    return {} ;
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
