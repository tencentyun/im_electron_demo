import React from "react";
import { useSelector } from "react-redux";
import { LoadingContainer } from "../../../components/loadingContainer";
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
import { GroupJoinOption } from "./GroupJoinOption";

export const GroupSetting = (props: {
  conversationInfo: State.conversationItem;
  close: () => void;
}): JSX.Element => {
  const { conversationInfo, close } = props;
  const groupId = conversationInfo.conv_id;
  const groupDetail: Partial<State.conversationItem['conv_profile']> = conversationInfo.conv_profile || {};

  const { userId } = useSelector((state: State.RootState) => state.userInfo);

  console.log('userId', userId)

  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    return await getGroupMemberInfoList({
      groupId,
    })
  }, [groupId]); 

  const memberList = value?.filter(item =>  item !== undefined &&  item !== "undefined" && item != "" && item != null) || [];

  // 群主置顶
  if (memberList?.length > 1) {
    const index = memberList?.findIndex(item => item?.group_member_info_member_role === 3)
    const groupOwner = memberList?.find(item => item?.group_member_info_member_role === 3)
    if(groupOwner){
      memberList.splice(index, 1) 
      memberList.unshift(groupOwner)
    }
   
  }

   
  const currentUserSetting =
    memberList.find((v) => v?.user_profile_identifier === userId) || {};

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
        userList={memberList}
        onRefresh={retry}
        userId={userId}
        groupId={groupDetail.group_detial_info_group_id}
        groupType={groupDetail.group_detial_info_group_type}
        groupAddOption={groupDetail.group_detial_info_add_option}
        userIdentity={currentUserSetting.group_member_info_member_role}
      />
      {
        groupDetail.group_detial_info_group_type === 0 &&
        <>
          <Divider />
          <GroupJoinOption
            joinOption={groupDetail.group_detial_info_add_option}
            groupId={groupDetail.group_detial_info_group_id}
            userIdentity={currentUserSetting.group_member_info_member_role}
            onRefresh={retry}
          />
        </>
      }
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
        userList={memberList}
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
