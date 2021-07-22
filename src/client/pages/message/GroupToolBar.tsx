import React, { useState } from "react";
import { useDialogRef } from "../../utils/react-use/useDialog";
import "./group-tool-bar.scss";

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

  const popupContainer = document.getElementById("messageInfo");

  return (
    <>
      <div className="tool-bar" id="toolBar">
        {tools.map(({ id, title }) => (
          <div
            key={id}
            className="tool-bar--item"
            onClick={(e) => {
              if (active !== id) {
                setActive(id);
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
    </>
  );
};
