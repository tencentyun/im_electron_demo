import timRenderInstance from "../../../utils/timRenderInstance";

type FriendList = {
  friend_profile_identifier: string;
  friend_profile_group_name_array: string;
  friend_profile_remark: string;
  friend_profile_add_wording: string;
  friend_profile_add_source: string;
  friend_profile_add_time: number;
  friend_profile_user_profile: State.userProfile;
  friend_profile_custom_string_array: string;
}[];

export const getFriendList = async (): Promise<FriendList> => {
  const { data } = await timRenderInstance.TIMFriendshipGetFriendProfileList();
  console.log('data', data)
  const { code, desc, json_params } = data;
  if (code === 0) {
    return JSON.parse(json_params);
  }
  return [];
};
