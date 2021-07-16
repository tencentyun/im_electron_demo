import { Input } from "tea-component";
import React, { useEffect, useState } from "react";
import { modifyGroupInfo } from "../api";
import { EditIcon } from "./EditIcon";
import "./group-accountecment.scss";

export const GroupAccountecment = (props: {
  accountecment: string;
  groupId: string;
  onRefresh: () => Promise<any>
}): JSX.Element => {
  const { accountecment, groupId, onRefresh } = props;

  const [input, setInput] = useState(accountecment);
  const [isEdit, setIsEdit] = useState(false);

  const handleModify = async () => {
    try {
      await modifyGroupInfo({
        groupId,
        modifyParams: {
          group_modify_info_param_notification: input,
        },
      });
      await onRefresh();
      setIsEdit(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    setInput(accountecment);
  }, [accountecment]);

  return (
    <div className="group-accountecment">
      <div className="group-accountecment--title">
        <span className="group-accountecment--title__text">群公告</span>
        {!isEdit && <EditIcon onClick={() => setIsEdit(true)} />}
      </div>
      {isEdit ? (
        <Input
          className="group-accountecment--input"
          size="full"
          placeholder="输入后群公告后按回车进行设置"
          value={input}
          onChange={(value) => {
            setInput(value);
          }}
          onKeyDown={(e) => {
            if (e.which === 13) {
              handleModify();
            }
          }}
        />
      ) : (
      <div className="group-accountecment--info">{input || ''}</div>
      )}
    </div>
  );
};
