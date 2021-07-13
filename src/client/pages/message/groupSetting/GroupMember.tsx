import React from "react";
import { Avatar } from "../../../components/avatar/avatar";
import './group-member.scss';

export const GroupMember = (props: { userList: {user_profile_face_url: string}[] }): JSX.Element => {
 const {userList} = props;

  return (
    <div className="group-member">
      <div className="group-member--title">群成员</div>
      <div className="group-member--avatar">
      {userList?.slice(0,15)?.map((v, index) => (
        <Avatar key={`${v.user_profile_face_url}-${index}`} url={v.user_profile_face_url} />
      ))}
      </div>
    </div>
  );
};
