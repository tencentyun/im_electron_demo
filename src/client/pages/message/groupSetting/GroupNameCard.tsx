import { Input } from "tea-component";
import React, { useEffect, useState } from "react";
import { modifyGroupMemberInfo } from "../api";
import { EditIcon } from "./EditIcon";
import "./group-name-card.scss";
import { ConfirmDialog, ConfirmDialogRecordsType } from "./ConfirmDialog";
import { useDialogRef } from "../../../utils/react-use/useDialog";
import { ipcRenderer } from "electron";

export const GroupNameCard = (props: {
  nameCard: string;
  userId: string;
  groupId: string;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { nameCard, groupId, userId, onRefresh } = props;

  const [input, setInput] = useState(nameCard);
  const [isEdit, setIsEdit] = useState(false);

  const dialogRef = useDialogRef<ConfirmDialogRecordsType>();

  const handleModify = async () => {
    await modifyGroupMemberInfo({
      groupId,
      userId,
      modifyGroupMemberParams: {
        group_modify_member_info_name_card: input,
      },
    });

    //刷新群设置成员信息
    ipcRenderer.send('onRedbawViews', 0, groupId)
  };

  useEffect(() => {
    console.log("群昵称",nameCard)
    setInput(nameCard);
  }, [nameCard]);

  return (
    <>
      <div className="group-name-card">
        <div className="group-name-card--title">
          <span className="group-name-card--title__text">我在本群的昵称</span>
          {!isEdit && <EditIcon onClick={() => setIsEdit(true)} />}
        </div>
        {isEdit ? (
          <Input
            className="group-name-card--input"
            size="full"
            placeholder="输入我在本群的昵称后按回车进行设置"
            value={input}
            onChange={(value) => {
              setInput(value);
            }}
            onBlur={() => {
              dialogRef.current.open({
                description: `是否将我在本群的昵称修改为`,
                modifyContent: input,
                onConfirm: handleModify,
              });
            }}
            onKeyDown={(e) => {
              if (e.which === 13) {
                dialogRef.current.open({
                  description: `是否将我在本群的昵称修改为`,
                  modifyContent: input,
                  onConfirm: handleModify,
                });
              }
            }}
          />
        ) : (
          <div>{input}</div>
        )}
      </div>
      <ConfirmDialog
        dialogRef={dialogRef}
        onSuccess={() => {
          onRefresh();
          setIsEdit(false);
        }}
      />
    </>
  );
};
