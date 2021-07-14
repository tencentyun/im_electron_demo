import { DialogRef, useDialog } from "../../utils/react-use/useDialog";
import { Drawer, H3, H5 } from "@tencent/tea-component";
import React from "react";

import "./group-tool-drawer.scss";
import { GroupSetting } from "./groupSetting/GroupSetting";

export interface GroupToolRecordsType {
  conversationInfo: State.conversationItem;
  toolId: string;
}

export const GroupToolDrawer = (props: {
  onSuccess?: () => void;
  onClose?: () => void;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupToolRecordsType>;
}): JSX.Element => {
  const { onClose, dialogRef, popupContainer } = props;

  const [visible, setShowState, defaultForm] = useDialog<GroupToolRecordsType>(
    dialogRef,
    {
      toolId: "query-message",
    }
  );

  const close = () => {
    setShowState(false);
    onClose();
  };

  const getTitle = () => {
    let title = "";
    let subTitle = "";
    const memberNum =
      defaultForm.conversationInfo?.conv_profile
        ?.group_detial_info_member_num || 0;
    switch (defaultForm.toolId) {
      case "query-message": {
        title = "聊天记录";
        break;
      }
      case "announcement": {
        title = "群公告";
        subTitle = "最近修改：";
        break;
      }
      case "setting": {
        title = "设置";
        subTitle = `群成员 | ${memberNum}`;
        break;
      }
    }

    return { title, subTitle };
  };

  const { title, subTitle } = getTitle();


  return (
    <Drawer
      disableAnimation={true}
      visible={visible}
      title={
        <div className="tool-drawer--title">
          <H3>{title}</H3>
          <span className="tool-drawer--title__sub">{subTitle}</span>
        </div>
      }
      className="tool-drawer"
      popupContainer={popupContainer}
      onClose={close}
    >
    {defaultForm.toolId === 'setting' && <GroupSetting close={close} conversationInfo={defaultForm.conversationInfo} />}
    </Drawer>
  );
};
