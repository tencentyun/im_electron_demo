import { Button } from "@tencent/tea-component";
import React from "react";
import "./group-item.scss";

export const GroupItem = (props: {
  groupName: string;
  groupAvatar: string;
  groupId: string;
}): JSX.Element => {
  const { groupId, groupAvatar, groupName } = props;

  return (
    <div className="group-item">
      <div className="group-item--left">
        <img src={groupAvatar} className="group-item--left__avatar" alt="" />
        <span className="group-item--left__name">{groupName}</span>
      </div>
      <div className="group-item--right">
        {/* <Button className="group-item--right__button" type="text">
          退出群聊
        </Button> */}

        <Button className="group-item--right__button" type="text">
          解散群聊
        </Button>
      </div>
    </div>
  );
};
