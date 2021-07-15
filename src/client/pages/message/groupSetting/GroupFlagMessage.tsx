import { Select } from "@tencent/tea-component";
import React, { useEffect, useState } from "react";
import { modifyGroupMemberInfo } from "../api";
import "./group-flag-message.scss";

const flagMsgOptions = [
  { value: "0", text: "接收消息并提示" },
  { value: "1", text: "接收消息但不提示" },
  { value: "2", text: "屏蔽消息" },
];

export const GroupFlagMessage = (props: {
  flagMsg: string;
  userId: string;
  groupId: string;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { flagMsg, userId, groupId, onRefresh } = props;

  const handleChange = async (value: string) => {
    try {
      await modifyGroupMemberInfo({
        groupId,
        userId,
        modifyGroupMemberParams: {
          group_modify_member_info_msg_flag: Number(value),
        },
      });
      await onRefresh();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="group-flag-message">
      <div className="group-flag-message--title">
        <span className="group-flag-message--title__text">群消息提示</span>
      </div>
      <Select
        size="full"
        type="simulate"
        appearance="button"
        className="group-flag-message--select"
        value={"" + flagMsg}
        onChange={(value) => handleChange(value)}
        options={flagMsgOptions}
      />
    </div>
  );
};
