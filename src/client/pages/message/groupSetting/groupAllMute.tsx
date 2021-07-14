import { Checkbox, message } from "@tencent/tea-component";
import React, { useEffect, useState } from "react";
import { modifyGroupInfo } from "../api";

import "./group-all-mute.scss";

export const GroupAllMute = (props: {
  muteFlag: boolean;
  groupId: string;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { muteFlag, groupId, onRefresh } = props;


  const handleChange = async (value: boolean) => {
    try {
      await modifyGroupInfo({
        groupId,
        modifyParams: { group_modify_info_param_is_shutup_all: value },
      });
      message.success({ content: value ? "全体禁言" : "取消全体禁言" });
      await onRefresh();
    } catch (e) {
      console.log(e);
    }
  };

  // useEffect(() => {
  //   setValue(muteFlag);
  // }, [muteFlag]);

  return (
    <div className="group-all-mute">
      <Checkbox value={muteFlag} onChange={handleChange}>
        全员禁言
      </Checkbox>
    </div>
  );
};
