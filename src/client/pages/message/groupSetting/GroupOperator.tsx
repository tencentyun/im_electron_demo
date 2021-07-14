import { Button, PopConfirm } from "@tencent/tea-component";
import React, { useState } from "react";
import { useDialogRef } from "../../../utils/react-use/useDialog";
import { quitGroup } from "../../relationship/group/api";
import "./group-operator.scss";
import {
  TransferGroupDialog,
  TRansferGroupRecordsType,
} from "./TransferGroupDialog";

export const GroupOperator = (props: {
  groupId: string;
  userId: string;
  groupOwner: string;
  groupType: number;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { groupId, userId, groupType, groupOwner, onRefresh } = props;
  const [quitLoading, setQuitLoading] = useState(false);

  const transferDialogRef = useDialogRef<TRansferGroupRecordsType>();

  const isOwner = groupOwner === userId;

  // 私有群全员可退出群聊 其他群只有非群主可以退出
  const canQuitGroup = groupType === 1 || !isOwner;

  // 只有群主可以进行群转让 直播群不可以转让
  const canTransferGroup = isOwner && groupType !== 3;

  const handleQuitGroup = async () => {
    setQuitLoading(true);
    try {
      await quitGroup(groupId);
      onRefresh();
    } catch (e) {
      console.log(e.message);
    }
    setQuitLoading(false);
  };

  return (
    <>
      <div className="group-operator">
      {canQuitGroup &&  <PopConfirm
          title="确认要退出群聊吗?"
          footer={(close) => (
            <>
              <Button
                type="link"
                loading={quitLoading}
                onClick={() => {
                  handleQuitGroup();
                  close();
                }}
              >
                确认
              </Button>
              <Button type="text" onClick={close}>
                取消
              </Button>
            </>
          )}
        >
          <Button type="error" className="group-operator--btn">
            退出群组
          </Button>
        </PopConfirm>}
        <div className="group-operator--divider" />
      {canTransferGroup &&  <Button
          className="group-operator--btn"
          onClick={() => transferDialogRef.current.open({ groupId })}
        >
          转让群组
        </Button>}
      </div>
      <TransferGroupDialog
        dialogRef={transferDialogRef}
        onSuccess={onRefresh}
      />
    </>
  );
};
