import { Input } from "@tencent/tea-component";
import React, { useEffect, useState } from "react";
import { modifyGroupMemberInfo } from "../api";
import { EditIcon } from "./EditIcon";
import "./group-name-card.scss";

export const GroupNameCard = (props: {
  nameCard: string;
  userId: string;
  groupId: string;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { nameCard, groupId, userId, onRefresh } = props;

  const [input, setInput] = useState(nameCard);
  const [isEdit, setIsEdit] = useState(false);

  const handleModify = async () => {
    try {
      await modifyGroupMemberInfo({
        groupId,
        userId,
        modifyGroupMemberParams: {
          group_modify_member_info_name_card: input,
        },
      });
      await onRefresh();
      setIsEdit(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    setInput(nameCard);
  }, [nameCard]);

  return (
    <div className="group-name-card">
      <div className="group-name-card--title">
        <span className="group-name-card--title__text">群名片</span>
        {!isEdit && <EditIcon onClick={() => setIsEdit(true)} />}
      </div>
      {isEdit ? (
        <Input
          className="group-name-card--input"
          size="full"
          placeholder="输入后名片内容后按回车进行设置"
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
        <div>{input}</div>
      )}
    </div>
  );
};
