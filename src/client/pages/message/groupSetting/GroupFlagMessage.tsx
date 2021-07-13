import { Select } from "@tencent/tea-component";
import React from "react";
import "./group-flag-message.scss";

const flagMsgOptions = [
  { value: "0", text: "接收消息并提示" },
  { value: "1", text: "接收消息但不提示" },
  { value: "2", text: "屏蔽消息" },
];

export const GroupFlagMessage = (props: { flagMsg: string }): JSX.Element => {
  const { flagMsg } = props;

  return (
    <div className="group-flag-message">
      <div className="group-flag-message--title">
        <span className="group-flag-message--title__text">群消息提示</span>
      </div>
      <Select
        size="full"
        type="simulate"
        appearance="button"
        value={'' + flagMsg}
        options={flagMsgOptions}
      />
    </div>
  );
};
