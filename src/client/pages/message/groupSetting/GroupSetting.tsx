import React from "react";
import { useSelector } from "react-redux";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import { getGroupInfoList, getGroupMemberInfoList } from "../api";
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

  const { userId } = useSelector((state: State.RootState) => state.userInfo);

  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    const [r1, r2] = await Promise.all([
      getGroupMemberInfoList({
        groupId,
      }),
      getGroupInfoList([groupId]),
    ]);

    return { memberList: r1, groupDetail: r2[0] || [] };
  }, [groupId]);

  const memberList = value?.memberList || [];
  const groupDetail = value?.groupDetail || {};

  console.log("groupDetail", groupDetail);

  const currentUserSetting =
    memberList.find((v) => v.user_profile_identifier === userId) || {};

  console.log("currentUserSetting", currentUserSetting);

  return (
    <div>
      <GroupBaseInfo
        groupAvatar={groupDetail.group_detial_info_face_url}
        groupId={groupDetail.group_detial_info_group_id}
        groupName={groupDetail.group_detial_info_group_name}
        groupType={groupDetail.group_detial_info_group_type}
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
        onRefresh={retry}
      />
      <Divider />
      <GroupMember
        userList={memberList}
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
    </div>
  );
};
