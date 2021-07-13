import { Button } from "@tencent/tea-component";
import React from "react";
import "./group-operator.scss";

export const GroupOperator = (): JSX.Element => {
  return (
    <div className="group-operator">
      <Button type="error" className="group-operator--btn">
        退出群组
      </Button>
      <div className="group-operator--divider" />
      <Button className="group-operator--btn">转让群组</Button>
    </div>
  );
};
