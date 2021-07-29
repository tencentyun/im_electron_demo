import React from "react";
import { useSelector } from "react-redux";
import { LoadingContainer } from "../../../components/loadingContainer";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import { getGroupMemberList } from "../api";
import { Divider } from "./Divider";
import { GroupAccountecment } from "./GroupAccountecment";
import { GroupAllMute } from "./groupAllMute";
import { GroupBaseInfo } from "./GroupBaseInfo";
import { GroupFlagMessage } from "./GroupFlagMessage";
import { GroupIntroduction } from "./GroupIntroduction";
import { GroupMember } from "./GroupMember";
import { GroupNameCard } from "./GroupNameCard";
import { GroupOperator } from "./GroupOperator";

export const GroupSetting = (props: {
  conversationInfo: State.conversationItem;
  close: () => void;
}): JSX.Element => {
  const { conversationInfo, close } = props;
  const groupId = conversationInfo.conv_id;
  const groupDetail: Partial<State.conversationItem['conv_profile']> = conversationInfo.conv_profile || {};

  const { userId } = useSelector((state: State.RootState) => state.userInfo);

  // 当前用户的群配置
  const { value, loading, retry } = useAsyncRetryFunc(async () => {
      return await getGroupMemberList({
        groupId,
        userIds: userId.length ?  [userId] : [],
        nextSeq: 0,
      })
  }, []);

  const memberList = value?.group_get_memeber_info_list_result_info_array || [];

  const currentUserSetting: any = memberList?.[0] || {};

  console.log("currentUserSetting", currentUserSetting);

  return (
    <LoadingContainer loading={loading}>
      <GroupBaseInfo
        groupAvatar={groupDetail.group_detial_info_face_url}
        groupId={groupDetail.group_detial_info_group_id}
        groupName={groupDetail.group_detial_info_group_name}
        groupType={groupDetail.group_detial_info_group_type}
        userIdentity={currentUserSetting.group_member_info_member_role}
        onRefresh={retry}
      />
      <Divider />
      <GroupIntroduction
        introduction={groupDetail.group_detial_info_introduction}
        groupId={groupDetail.group_detial_info_group_id}
        onRefresh={retry}
        userIdentity={currentUserSetting.group_member_info_member_role}
        groupType={groupDetail.group_detial_info_group_type}
      />
      <Divider />
      <GroupAccountecment
        accountecment={groupDetail.group_detial_info_notification}
        groupId={groupDetail.group_detial_info_group_id}
        userIdentity={currentUserSetting.group_member_info_member_role}
        groupType={groupDetail.group_detial_info_group_type}
        onRefresh={retry}
      />
      <Divider />
      <GroupMember
        onRefresh={retry}
        userId={userId}
        groupId={groupDetail.group_detial_info_group_id}
        groupType={groupDetail.group_detial_info_group_type}
        groupAddOption={groupDetail.group_detial_info_add_option}
        userIdentity={currentUserSetting.group_member_info_member_role}
      />
      <Divider />
      <GroupFlagMessage
        flagMsg={currentUserSetting.group_member_info_msg_flag}
        groupId={groupDetail.group_detial_info_group_id}
        userId={userId}
        onRefresh={retry}
      />
      <Divider />
      <GroupNameCard
        nameCard={currentUserSetting.group_member_info_name_card}
        groupId={groupDetail.group_detial_info_group_id}
        userId={userId}
        onRefresh={retry}
      />
      <Divider />
      <GroupAllMute
        muteFlag={groupDetail.group_detial_info_is_shutup_all}
        groupId={groupDetail.group_detial_info_group_id}
        onRefresh={retry}
        userIdentity={currentUserSetting.group_member_info_member_role}
        groupType={groupDetail.group_detial_info_group_type}
      />
      <Divider />
      <GroupOperator
        userId={userId}
        groupId={groupDetail.group_detial_info_group_id}
        onRefresh={retry}
        groupOwner={groupDetail.group_detial_info_owener_identifier}
        groupType={groupDetail.group_detial_info_group_type}
        close={close}
      />
    </LoadingContainer>
  );
};
