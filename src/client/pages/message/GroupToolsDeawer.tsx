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

  const memberNum =
    defaultForm.conversationInfo?.conv_profile?.group_detial_info_member_num ||
    0;

  console.log("conversationInfo", currentSelectedConversation);

  const close = () => {
    setShowState(false);
    onClose();
  };

  useEffect(() => {
    console.log("conversationInfo", currentSelectedConversation);
    if (visible) {
      close();
    }
  }, [currentSelectedConversation]);

  return (
    <Drawer
      visible={visible}
      title={
        <div className="tool-drawer--title">
          <H3>设置</H3>
          <span className="tool-drawer--title__sub">{`群成员 | ${memberNum}`}</span>
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
