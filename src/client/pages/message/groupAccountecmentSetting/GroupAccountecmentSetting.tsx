import { Button, TextArea } from "tea-component";
import React, { useState , useEffect } from "react";
import { useDispatch } from "react-redux";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import {
  replaceConversaionList,
  updateCurrentSelectedConversation,
} from "../../../store/actions/conversation";
import { getConversionList, getGroupInfoList, modifyGroupInfo } from "../api";
import "./group-accountecment-setting.scss";


export const GroupAccountecmentSetting = (props: {
  conversationInfo: State.conversationItem;
  close: () => void;
}): JSX.Element => {
  const { close, conversationInfo } = props;
  const dispatch = useDispatch();
  const groupId = conversationInfo?.conv_id || "";

  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    const result = await getGroupInfoList([groupId]);

    return result[0] || {};
  }, [groupId]);

  const accountecment = value?.group_detial_info_notification || "";

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
  }, [accountecment])

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
