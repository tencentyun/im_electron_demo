import { useDialogRef } from "../../utils/react-use/useDialog";
import { Drawer, H3 } from "tea-component";
import React, { useEffect, useState } from "react";

import "./group-tool-drawer.scss";
import { GroupSetting } from "./groupSetting/GroupSetting";
import { GroupAccountecmentSetting } from "./groupAccountecmentSetting/GroupAccountecmentSetting";
import { useSelector } from "react-redux";
import { GroupProfileDrawer, GroupProfileRecordsType } from "./groupSetting/GroupProfileDrawer";

export interface GroupToolsgRecordsType {
  conversationInfo: State.conversationItem;
  toolId: string;
}

export const GroupToolsDrawer = (props: {
  onSuccess?: () => void;
  onClose?: () => void;
  popupContainer?: HTMLElement;
  visible: boolean;
  conversationInfo: State.conversationItem;
  toolId: string;
}): JSX.Element => {
  const { onClose, popupContainer, visible, conversationInfo, toolId } = props;
  // console.log("visible", visible);

  const { currentSelectedConversation } = useSelector(
    (state: State.RootState) => state.conversation
  );

  const DisplayComponent = {
    setting: GroupSetting,
    announcement: GroupAccountecmentSetting,
  }[toolId];

  const close = () => {
    onClose?.();
  };

  // console.log("toolsTab", toolId);

  const getTitleAndSubTitle = (toolsId: string) => {
    let title = "";
    let subTitle = "";
    const memberNum =
      conversationInfo?.conv_profile?.group_detial_info_member_num || 0;
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

  const { title, subTitle } = getTitleAndSubTitle(toolId);

  useEffect(() => {
    if (visible) {
      close();
    }
  }, [currentSelectedConversation.conv_id]);

  const profileDialogRef = useDialogRef<GroupProfileRecordsType>();
  const groupDetail: Partial<State.conversationItem['conv_profile']> = conversationInfo?.conv_profile || {};
  const { userId } = useSelector((state: State.RootState) => state.userInfo);
  const isOwener = groupDetail.group_detial_info_owener_identifier === userId
  
  return (
    <Drawer
      visible={visible}
      title={
        <div className="tool-drawer--title">
          <H3>{title}</H3>
          <span className="tool-drawer--title__sub">{subTitle}</span>
          { isOwener && <span className="tool-drawer--modify__profile" onClick={() => profileDialogRef.current.open({ groupDetail })}>修改群资料</span>}
        </div>
      }
      outerClickClosable={false}
      className="tool-drawer"
      popupContainer={popupContainer}
      onClose={close}
    >
      {toolId === "setting" && conversationInfo.conv_type === 2 && (
        <GroupSetting close={close} conversationInfo={conversationInfo} />
      )}
      {toolId === "announcement" && (
        <GroupAccountecmentSetting
          close={close}
          conversationInfo={conversationInfo}
        />
      )}
      { isOwener &&
        <GroupProfileDrawer
          popupContainer={popupContainer}
          dialogRef={profileDialogRef}
        />
      }
    </Drawer>
  );
};
