import { Checkbox } from "@tencent/tea-component";
import React from "react";

import "./group-all-mute.scss";

export const groupAllMute = (props: { muteFlag: string }): JSX.Element => {
  const { muteFlag } = props;
  return (
    <div className="group-all-mute">
      <Checkbox value={true}>全员禁言</Checkbox>
    </div>
  );
};
