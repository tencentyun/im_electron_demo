import React, { useState } from "react";
import { useDialogRef } from "../../utils/react-use/useDialog";
import "./group-tool-bar.scss";
import {
  GroupAccountecmentSettingDrawer,
  GroupAccountecmentSettingRecordsType,
} from "./GroupAccountecmentSettingDrawer";
import {
  GroupSettingDrawer,
  GroupSettingRecordsType,
} from "./GroupSettingDrawer";
import { GroupToolsDrawer, GroupToolsgRecordsType } from "./GroupToolsDeawer";

const tools = [
  // {
  //   id: "query-message",
  //   title: "聊天记录",
  // },
  {
    id: "announcement",
    title: "群公告",
  },
  {
    id: "setting",
    title: "设置",
  },
];

export const GroupToolBar = (props: {
  conversationInfo: State.conversationItem;
}): JSX.Element => {
  const { conversationInfo } = props;

  const [active, setActive] = useState("");

  const addActiveClass = (id: string): string =>
    active === id ? "is-active" : "";

  const groupToolsRef = useDialogRef<GroupToolsgRecordsType>();

  const groupSettingRef = useDialogRef<GroupSettingRecordsType>();
  const groupAccountecmentSettingRef =
    useDialogRef<GroupAccountecmentSettingRecordsType>();

  const popupContainer = document.getElementById("messageInfo");

  const refMap = {
    announcement: groupAccountecmentSettingRef,
    setting: groupSettingRef,
  };

  return (
    <>
      <div className="tool-bar" id="toolBar">
        {tools.map(({ id, title }) => (
          <div
            key={id}
            className="tool-bar--item"
            onClick={(e) => {
              console.log("test", e);
              if (active !== id) {
                setActive(id);
                // const ref = refMap[id];
                // ref.current.open({ conversationInfo });
                groupToolsRef.current.open({ conversationInfo, toolId: id });
              } else {
                groupToolsRef.current.close();
                setActive('')
              }
            }}
          >
            <span
              className={`tool-bar--item__icon ${id} ${addActiveClass(id)}`}
            ></span>
          </div>
        ))}
      </div>
      <GroupToolsDrawer
        dialogRef={groupToolsRef}
        popupContainer={popupContainer}
        onClose={() => setActive("")}
      />
      {/* <GroupSettingDrawer
        dialogRef={groupSettingRef}
        popupContainer={popupContainer}
        onClose={() => setActive("")}
      />
      <GroupAccountecmentSettingDrawer
        dialogRef={groupAccountecmentSettingRef}
        popupContainer={popupContainer}
        onClose={() => setActive("")}
      /> */}
    </>
  );
};
