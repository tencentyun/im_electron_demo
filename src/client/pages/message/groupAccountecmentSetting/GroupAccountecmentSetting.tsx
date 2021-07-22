import { Button, TextArea } from "tea-component";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";

import {
  getGroupInfoList,
  getGroupMemberInfoList,
  modifyGroupInfo,
} from "../api";
import "./group-accountecment-setting.scss";
import { LoadingContainer } from "../../../components/loadingContainer";

export const GroupAccountecmentSetting = (props: {
  conversationInfo: State.conversationItem;
  close: () => void;
}): JSX.Element => {
  const { close, conversationInfo } = props;
  console.log("conversationInfo", conversationInfo);
  const groupId = conversationInfo?.conv_id || "";

  const { userId } = useSelector((state: State.RootState) => state.userInfo);

  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    const [r1, r2] = await Promise.all([
      getGroupMemberInfoList({
        groupId,
      }),
      getGroupInfoList([groupId]),
    ]);

    return { memberList: r1, groupDetail: r2[0] || [] };
  }, [groupId]);

  const memberList = value?.memberList || [];
  const groupDetail = value?.groupDetail || {};

  console.log("groupDetail", groupDetail);

  const currentUserSetting =
    memberList.find((v) => v.user_profile_identifier === userId) || {};

  console.log("currentUserSetting", currentUserSetting);
  const accountecment = groupDetail?.group_detial_info_notification || "";
  const groupType = groupDetail?.group_detial_info_group_type || 0;
  const userIdentity = currentUserSetting?.group_member_info_member_role || 0;

  const [input, setInput] = useState(accountecment);
  const [settingLoading, setSettingloading] = useState(false);

  const handleModify = async () => {
    setSettingloading(true);
    try {
      await modifyGroupInfo({
        groupId,
        modifyParams: {
          group_modify_info_param_notification: input,
        },
      });
      close();
    } catch (e) {
      console.log(e.message);
    }
    setSettingloading(false);
  };

  useEffect(() => {
    setInput(accountecment);
  }, [accountecment]);

   /**
   * 当前不是修改状态，才出现修改按钮
   * 对于公开群、聊天室和直播大群，只有群主或者管理员可以修改群简介。
   * 对于私有群，任何人可修改群简介。
   * 用户身份类型 memberRoleMap
   * 群类型  groupTypeMap
   */
  const canEdit = groupType === 1 || [2, 3].includes(userIdentity);

  return (
    <LoadingContainer loading={loading}>
      <div className="group-accountecment-setting">
        <TextArea
          className="group-accountecment-setting--textarea"
          size="full"
          value={input}
          onChange={(value) => setInput(value)}
        />
        <Button
          className="group-accountecment-setting--button"
          type="primary"
          loading={settingLoading}
          onClick={handleModify}
          disabled={!canEdit}
        >
          确认并发送至群内
        </Button>
      </div>
    </LoadingContainer>
  );
};
