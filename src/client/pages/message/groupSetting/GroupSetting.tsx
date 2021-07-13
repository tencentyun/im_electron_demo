import React from "react";
import { useSelector } from "react-redux";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import { getGroupMemberInfoList } from "../api";
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
}): JSX.Element => {
  const { conversationInfo } = props;
  const groupDeatil = conversationInfo.conv_profile;

  const { userId } = useSelector((state: State.RootState) => state.userInfo);

  const {
    value = [],
    loading,
    retry,
  } = useAsyncRetryFunc(async () => {
    return await getGroupMemberInfoList({
      groupId: groupDeatil.group_detial_info_group_id,
    });
  }, [groupDeatil]);

  const currentUserSetting =
    value.find((v) => v.user_profile_identifier === userId) || {};

  console.log("value", value);
  console.log('currentUserSetting', currentUserSetting)

  return (
    <div>
      <GroupBaseInfo
        groupAvatar={groupDeatil.group_detial_info_face_url}
        groupId={groupDeatil.group_detial_info_group_id}
        groupName={groupDeatil.group_detial_info_group_name}
        groupType={groupDeatil.group_detial_info_group_type}
      />
      <Divider />
      <GroupIntroduction
        introduction={groupDeatil.group_detial_info_introduction}
        groupId={groupDeatil.group_detial_info_group_id}
      />
      <Divider />
      <GroupAccountecment
        accountecment={groupDeatil.group_detial_info_notification}
        groupId={groupDeatil.group_detial_info_group_id}
      />
      <Divider />
      <GroupMember userList={value} />
      <Divider />
      <GroupFlagMessage
        flagMsg={currentUserSetting.group_member_info_msg_flag}
      />
      <Divider />
      <GroupNameCard nameCard={currentUserSetting.group_member_info_name_card} />
      <Divider />
      <GroupAllMute  muteFlag={groupDeatil.group_detial_info_is_shutup_all}/>
      <Divider />
      <GroupOperator />
    </div>
  );
};
