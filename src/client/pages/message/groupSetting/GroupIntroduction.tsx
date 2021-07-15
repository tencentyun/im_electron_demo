import { Input } from "@tencent/tea-component";
import React, { useEffect, useState } from "react";
import { modifyGroupInfo } from "../api";
import { EditIcon } from "./EditIcon";
import "./group-introduction.scss";

export const GroupIntroduction = (props: {
  introduction: string;
  groupId: string;
  onRefresh: () => Promise<any>
}): JSX.Element => {
  const { introduction, groupId , onRefresh} = props;

  const [input, setInput] = useState(introduction);
  const [isEdit, setIsEdit] = useState(false);

  
  const handleModify = async () => {
    try {
      await modifyGroupInfo({
        groupId,
        modifyParams: {
          group_modify_info_param_introduction: input,
        },
      });
      await onRefresh();
      setIsEdit(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    setInput(introduction);
  }, [introduction]);

  return (
    <div className="group-introduction">
      <div className="group-introduction--title">
        <span className="group-introduction--title__text">群介绍</span>
        {!isEdit && <EditIcon onClick={() => setIsEdit(true)} />}
      </div>
      {isEdit ? (
        <Input
          className="group-introduction--input"
          size="full"
          placeholder="输入后群介绍后按回车进行设置"
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
        <div className="group-introduction--info">{input || ''}</div>
      )}
    </div>
  );
};