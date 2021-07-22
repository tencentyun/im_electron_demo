import { DialogRef, useDialog } from "../../utils/react-use/useDialog";
import { Drawer, H3 } from "tea-component";
import React, { useEffect } from "react";

import "./group-tool-drawer.scss";
import { GroupSetting } from "./groupSetting/GroupSetting";
import { GroupAccountecmentSetting } from "./groupAccountecmentSetting/GroupAccountecmentSetting";
import { useSelector } from "react-redux";

export interface GroupToolsgRecordsType {
  conversationInfo: State.conversationItem;
  toolId: string;
}

export const GroupToolsDrawer = (props: {
  onSuccess?: () => void;
  onClose?: () => void;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupToolsgRecordsType>;
}): JSX.Element => {
  const { onClose, dialogRef, popupContainer } = props;

  const { currentSelectedConversation } = useSelector(
    (state: State.RootState) => state.conversation
  );

  const [visible, setShowState, defaultForm] =
    useDialog<GroupToolsgRecordsType>(dialogRef, {
      toolId: "setting",
    });

  const DisplayComponent = {
    setting: GroupSetting,
    announcement: GroupAccountecmentSetting,
  }[defaultForm.toolId];

  const close = () => {
    setShowState(false);
    onClose?.();
  };

  const getTitleAndSubTitle = (toolsId: string) => {
    let title = "";
    let subTitle = "";
    const memberNum =
      defaultForm.conversationInfo?.conv_profile
        ?.group_detial_info_member_num || 0;
    switch (toolsId) {
      case "setting":
        title = "设置";
        subTitle = `群成员 | ${memberNum}`;
        break;
      case "announcement":
        title = "群公告";
        break;
    }

    return { title, subTitle };
  };

  const { title, subTitle } = getTitleAndSubTitle(defaultForm.toolId);

  useEffect(() => {
    if (visible) {
      close();
    }
  }, [currentSelectedConversation.conv_id]);

  return (
    <Drawer
      visible={visible}
      title={
        <div className="tool-drawer--title">
          <H3>{title}</H3>
          <span className="tool-drawer--title__sub">{subTitle}</span>
        </div>
      }
      outerClickClosable={false}
      className="tool-drawer"
      popupContainer={popupContainer}
      onClose={close}
    >
      {/* <GroupSetting
        close={close}
        conversationInfo={defaultForm.conversationInfo}
      /> */}

      <DisplayComponent
        close={close}
        conversationInfo={defaultForm.conversationInfo}
      />
    </Drawer>
  );
};
