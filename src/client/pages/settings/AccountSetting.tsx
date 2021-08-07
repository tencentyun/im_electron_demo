import React from "react";
import { useDispatch } from "react-redux";
import { Button } from "tea-component";
import { useHistory } from "react-router-dom";

import { useState } from "react"
import timRenderInstance from "../../utils/timRenderInstance";
import { setIsLogInAction, userLogout } from "../../store/actions/login";
import "./AccountSetting.scss";
import { clearConversation } from '../../store/actions/conversation'
import { clearHistory } from '../../store/actions/message';

const { ipcRenderer } = require("electron");
export const AccountSetting = (): JSX.Element => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [pathurl,setPathUrl] = useState('');

  const loadFileMsg = () => {
    ipcRenderer.on("storagePath", (e, { path }) => {
      console.log(path);
      setPathUrl(path);
    });
  };

  loadFileMsg();

  const logOutHandler = async () => {
    await timRenderInstance.TIMLogout();
    dispatch(userLogout());
    history.replace('/login');
    dispatch(setIsLogInAction(false));
    dispatch(clearConversation())
    dispatch(clearHistory())
};
  return (
    <div className="connect">
      <header className="connect-header">
        <span className="connect-header--logo"></span>
        <span className="connect-header--text">设置</span>
      </header>
      <section className="connet-section">
        <div className="setting-content">
          <div className="setting-item">
            <span>版本信息</span>
            <span>0.0.1</span>
          </div>
          <div className="setting-item">
            <span>版权所有</span>
            <span className="item-val">珠海华润银行</span>
          </div>
          <div className="setting-item">
            <span>文件存储</span>
            <span className="item-val">{pathurl}</span>
          </div>
        </div>
        <Button
          onClick={logOutHandler}
          style={{
            fontSize: "16px",
            width: "200px",
            height: "40px",
            margin: "auto",
            marginLeft: "30%",
            marginTop: "20%",
          }}
        >
          退出登录
        </Button>
      </section>
    </div>
  );
};
