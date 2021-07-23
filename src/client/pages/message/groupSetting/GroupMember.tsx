import React from "react";
import { useDialogRef } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import "./group-member.scss";
import {
  GroupMemberListDrawer,
  GroupMemberListDrawerRecordsType,
} from "./MemberListDrawer";
import {
  DeleteGroupMemberDialog,
  DeleteMemberRecordsType,
} from "./DeleteGroupMember";

import {
  AddGroupMemberDialog,
  AddMemberRecordsType
}from '../../../components/pull/pull'

export const GroupMember = (props: {
  userList: {
    user_profile_face_url: string;
    user_profile_nick_name: string;
    group_member_info_member_role: number;
  }[];
  onRefresh: () => Promise<any>;
  userIdentity: number;
  userId: string;
  groupId: string;
  groupType: number;
  groupAddOption: number;
}): JSX.Element => {
  const {
    userList,
    groupId,
    groupType,
    groupAddOption,
    userId,
    userIdentity,
    onRefresh,
  } = props;

  const popupContainer = document.getElementById("messageInfo");

  const dialogRef = useDialogRef<GroupMemberListDrawerRecordsType>();

  const addMemberDialogRef = useDialogRef<AddMemberRecordsType>();

  const deleteMemberDialogRef = useDialogRef<DeleteMemberRecordsType>();

  const memberList = userList?.filter(
    (item) => ![2, 3].includes(item.group_member_info_member_role)
  );

  // 可拉人进群条件为 群类型不为直播群且当前群没有设置禁止加入
  const canInviteMember = [0, 1, 2].includes(groupType);

  /**
   * 对于私有群：只有创建者可删除群组成员。
   * 对于公开群和聊天室：只有管理员和群主可以踢人。
   * 对于直播大群：不能踢人
   * 用户身份类型 memberRoleMap
   * 群类型  groupTypeMap
   */
  const canDeleteMember =
    (groupType === 1 && userIdentity === 3) ||
    ([0, 2].includes(groupType) && [2, 3].includes(userIdentity));

  return (
    <>
      <div className="group-member">
        <div className="group-member--title">
          <span>群成员</span>
          {userList.length ? (
            <span
              className="group-member--title__right"
              onClick={() => dialogRef.current.open({ memberList: userList })}
            >
              <span style={{ marginRight: "4px" }}>{userList.length}人</span>
              <span>&gt;</span>
            </span>
          ) : (
            <></>
          )}
        </div>
        <div className="group-member--avatar">
          {userList?.slice(0, 15)?.map((v, index) => (
            <Avatar
              key={`${v.user_profile_face_url}-${index}`}
              url={v.user_profile_face_url}
            />
          ))}
          {canInviteMember && (
            <span
              className="group-member--add"
              onClick={() => addMemberDialogRef.current.open({ groupId })}
            ></span>
          )}
          {canDeleteMember && memberList.length ? (
            <span
              className="group-member--delete"
              onClick={() =>
                deleteMemberDialogRef.current.open({
                  groupId,
                  userList: memberList,
                })
              }
            ></span>
          ) : (
            <></>
          )}
        </div>
      </div>

      <GroupMemberListDrawer
        popupContainer={popupContainer}
        dialogRef={dialogRef}
      />
      <DeleteGroupMemberDialog
        dialogRef={deleteMemberDialogRef}
        onSuccess={() => onRefresh()}
      />
      <AddGroupMemberDialog
        dialogRef={addMemberDialogRef}
        onSuccess={() => onRefresh()}
      />
    </>
  );
};
