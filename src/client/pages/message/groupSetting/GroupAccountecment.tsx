import React from "react";
import { EditIcon } from "./EditIcon";
import "./group-accountecment.scss";

export const GroupAccountecment = (props: {
  accountecment: string;
  groupId: string;
}): JSX.Element => {
  const { accountecment, groupId } = props;
  return (
    <div className="group-accountecment">
      <div className="group-accountecment--title">
        <span className="group-accountecment--title__text">群公告</span>
        <EditIcon />
      </div>
      <div className="group-accountecment--info">{accountecment || ''}</div>
    </div>
  );
};
