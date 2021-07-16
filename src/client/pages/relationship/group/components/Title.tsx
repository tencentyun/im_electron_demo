import { Button } from "tea-component";
import React from "react";
import { useDialogRef } from "../../../../utils/react-use/useDialog";
import { GroupList } from "../api";
import { CreateGroupDialog } from "./CreateGroupDialog";
import "./title.scss";

const wait = (time) =>
  new Promise((reslove) => {
    setTimeout(() => reslove(true), time);
  });

export const Title = (props: {
  onRefresh: () => Promise<GroupList>;
}): JSX.Element => {
  const { onRefresh } = props;

  const createGroupDialogRef = useDialogRef();
  return (
    <>
      <div className="title">
        <div className="title--left">
          <span className="title--left__icon" />
          <span className="title--left__text">我的群组</span>
        </div>
        <div>
          <Button
            className="title--right__button"
            type="primary"
            onClick={() => createGroupDialogRef.current.open()}
          >
            创建群聊
          </Button>
        </div>
      </div>
      <CreateGroupDialog
        dialogRef={createGroupDialogRef}
        onSuccess={async () => {
          await wait(1000);
          await onRefresh();
        }}
      />
    </>
  );
};
