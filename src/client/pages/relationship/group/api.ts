import timRenderInstance from "../../../utils/timRenderInstance";

interface GroupList {
  group_base_info_face_url: string;
  group_base_info_group_id: string;
  group_base_info_group_name: string;
}

export const getJoinedGroupLis = async (): Promise<GroupList[]> => {
  const { data } = await timRenderInstance.TIMGroupGetJoinedGroupList();
  const { code, json_param } = data;
  console.log("groupList", JSON.parse(json_param));
  return JSON.parse(json_param);
};
