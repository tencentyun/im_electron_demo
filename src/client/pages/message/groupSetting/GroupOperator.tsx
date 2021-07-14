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
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { groupId, userId, onRefresh } = props;
  const [quitLoading, setQuitLoading] = useState(false);

  const transferDialogRef = useDialogRef<TRansferGroupRecordsType>();

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
        <PopConfirm
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
        </PopConfirm>
        <div className="group-operator--divider" />
        <Button
          className="group-operator--btn"
          onClick={() => transferDialogRef.current.open({ groupId })}
        >
          转让群组
        </Button>
      </div>
      <TransferGroupDialog
        dialogRef={transferDialogRef}
        onSuccess={onRefresh}
      />
    </>
  );
};
