import React from "react";
import { useDialogRef } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import "./group-member.scss";
import {
  GroupMemberListDrawer,
  GroupMemberListDrawerRecordsType,
} from "./MemberListDrawer";
import {
  AddMemberRecordsType,
  GroupAddMemberDialog,
} from "./GroupAddMemberDialog";

export const GroupMember = (props: {
  userList: { user_profile_face_url: string }[];
  onRefresh: () => Promise<any>;
  groupId: string;
  groupType: number;
  groupAddOption: number;
}): JSX.Element => {
  const { userList, groupId, groupType, groupAddOption, onRefresh } = props;

  const popupContainer = document.getElementById("messageInfo");

  const dialogRef = useDialogRef<GroupMemberListDrawerRecordsType>();

  const addMemberDialogRef = useDialogRef<AddMemberRecordsType>();

  // 可拉人进群条件为 群类型不为直播群且当前群没有设置禁止加入
  const canInviteMember = [0, 1, 2].includes(groupType) && groupAddOption !== 0;

  return (
    <>
      <div className="group-member">
        <div className="group-member--title">
          <span>群成员</span>
          <span
            className="group-member--title__right"
            onClick={() => dialogRef.current.open({ memberList: userList })}
          >
            <span style={{ marginRight: "4px" }}>{userList.length}人</span>
            <span>&gt;</span>
          </span>
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
            >
              加
            </span>
          )}
          <span className="group-member--delete">减</span>
        </div>
      </div>
      <GroupMemberListDrawer
        popupContainer={popupContainer}
        dialogRef={dialogRef}
      />
      <GroupAddMemberDialog
        dialogRef={addMemberDialogRef}
        onSuccess={() => onRefresh()}
      />
    </>
  );
};
