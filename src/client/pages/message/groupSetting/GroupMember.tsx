import React from "react";
import { useDialogRef } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import "./group-member.scss";
import {
  GroupMemberListDrawer,
  GroupMemberListDrawerRecordsType,
} from "./MemberListDrawer";

export const GroupMember = (props: {
  userList: { user_profile_face_url: string }[];
}): JSX.Element => {
  const { userList } = props;

  const popupContainer = document.getElementById("messageInfo");

  const dialogRef = useDialogRef<GroupMemberListDrawerRecordsType>();

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
        </div>
      </div>
      <GroupMemberListDrawer
        popupContainer={popupContainer}
        dialogRef={dialogRef}
      />
    </>
  );
};
