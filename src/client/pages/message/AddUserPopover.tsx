import { Input, Popover } from "@tencent/tea-component";
import React, { useState } from "react";
import './add-user-popover.scss'

export const AddUserPopover = (): JSX.Element => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      visible={visible}
      onVisibleChange={(visible) => setVisible(visible)}
      placement="bottom-start"
      trigger="click"
      overlay={
        <div className="overlay-content">
          <Input className="overlay-content--input" placeholder="输入UID后，回车添加成员" />
        </div>
      }
    >
     <span className={`add-icon ${visible ? 'is-active': ''}`} />
    </Popover>
  );
};
