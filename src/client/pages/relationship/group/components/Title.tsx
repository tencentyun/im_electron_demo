import { Button } from "@tencent/tea-component";
import React from "react";
import "./title.scss";

export const Title = (): JSX.Element => {
  console.log("Title");
  return (
    <div className="title">
      <div className="title--left">
        <span className="title--left__icon" />
        <span className="title--left__text">我的群组</span>
      </div>
      <div><Button className='title--right__button' type="primary">创建群聊</Button></div>
    </div>
  );
};
