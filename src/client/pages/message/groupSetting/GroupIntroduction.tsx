import React from "react";
import { EditIcon } from "./EditIcon";
import "./group-introduction.scss";

export const GroupIntroduction = (props: {
  introduction: string;
  groupId: string;
}): JSX.Element => {
  const { introduction, groupId } = props;
  return (
    <div className="group-introduction">
      <div className="group-introduction--title">
        <span className="group-introduction--title__text">群介绍</span>
        <EditIcon />
      </div>
      <div className="group-introduction--info">{introduction || ''}</div>
    </div>
  );
};
