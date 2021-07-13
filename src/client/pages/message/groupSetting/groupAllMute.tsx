import { Checkbox } from "@tencent/tea-component";
import React, { useEffect, useState } from "react";

import "./group-all-mute.scss";

export const GroupAllMute = (props: { muteFlag: boolean }): JSX.Element => {
  const { muteFlag } = props;
  
  const [value, setValue] = useState(muteFlag);


  const handleChange = (value: boolean) => {
    console.log(value, 'value');
    setValue(value)
  }

  useEffect(() => {
    setValue(muteFlag);
  }, [muteFlag]);

  return (
    <div className="group-all-mute">
      <Checkbox value={value} onChange={handleChange}>全员禁言</Checkbox>
    </div>
  );
};
