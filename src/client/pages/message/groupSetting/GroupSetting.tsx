import React from "react";
import { Divider } from "./Divider";
import { GroupAccountecment } from "./GroupAccountecment";
import { GroupBaseInfo } from "./GroupBaseInfo";
import { GroupIntroduction } from "./GroupIntroduction";
import { GroupMember } from "./GroupMember";

export const GroupSetting = (props: {
  conversationInfo: State.conversationItem;
}): JSX.Element => {
  const { conversationInfo } = props;
  const groupDeatil = conversationInfo.conv_profile;

  return (
    <div>
      <GroupBaseInfo
        groupAvatar={groupDeatil.group_detial_info_face_url}
        groupId={groupDeatil.group_detial_info_group_id}
        groupName={groupDeatil.group_detial_info_group_name}
        groupType={groupDeatil.group_detial_info_group_type}
      />
      <Divider />
      <GroupIntroduction  introduction={groupDeatil.group_detial_info_introduction} groupId={groupDeatil.group_detial_info_group_id} />
      <Divider />
      <GroupAccountecment accountecment={groupDeatil.group_detial_info_notification} groupId={groupDeatil.group_detial_info_group_id} />
      <Divider />
      <GroupMember groupId={groupDeatil.group_detial_info_group_id} />
    </div>
  );
};
