import { Checkbox, message } from "tea-component";
import React, { useEffect, useState } from "react";
import { modifyGroupInfo } from "../api";

import "./group-all-mute.scss";

export const GroupAllMute = (props: {
  muteFlag: boolean;
  groupId: string;
  userIdentity: number;
  groupType: number;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { muteFlag, groupId, userIdentity, onRefresh } = props;

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

  /**
   * 只有群主或者管理员可以进行全员禁言。
   * 用户身份类型 memberRoleMap
   * 群类型  groupTypeMap
   */
  const canEdit = [2, 3].includes(userIdentity);

  return (
    <div className="group-all-mute">
      <Checkbox value={muteFlag} onChange={handleChange} disabled={!canEdit}>
        全员禁言
      </Checkbox>
    </div>
  );
};
