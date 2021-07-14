import { Button, TextArea } from "@tencent/tea-component";
import React, { useState } from "react";
import { modifyGroupInfo } from "../api";
import "./group-accountecment-setting.scss";

export const GroupAccountecmentSetting = (props: {
  conversationInfo: State.conversationItem;
  close: () => void;
}): JSX.Element => {
  const { close, conversationInfo } = props;

  const groupId = conversationInfo?.conv_id || "";
  const accountecment =
    conversationInfo?.conv_profile?.group_detial_info_notification || "";

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
      // await onRefresh();
    } catch (e) {
      console.log(e.message);
    }
    setSettingloading(false);
  };

  return (
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
      >
        确认并发送至群内
      </Button>
    </div>
  );
};
