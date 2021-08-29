import React from "react";
import { useDispatch } from "react-redux";
import { Button, Switch } from "tea-component";
import { useHistory } from "react-router-dom";

import { useState, useEffect } from "react"
import timRenderInstance from "../../utils/timRenderInstance";
import { setIsLogInAction, userLogout } from "../../store/actions/login";
import "./AccountSetting.scss";
import { clearConversation } from '../../store/actions/conversation'
import { clearHistory } from '../../store/actions/message';

const { ipcRenderer } = require("electron");

import { version, description} from '../../../../package.json'
export const AccountSetting = (): JSX.Element => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [pathurl, setPathUrl] = useState('');
  const [msgBother, setMsgBother] = useState(null)

  ipcRenderer.on("storagePath", (e, { path }) => {
    console.log("storagePath", path);
    setPathUrl(path);
  });

  const setNewsMode = val => {
    console.log(val, 'val')
    setMsgBother(val)
    window.localStorage.setItem('msgBother', val)
  }

  useEffect(() => {
    const initVal = window.localStorage.getItem('msgBother') == 'true' ? true : false
    setMsgBother(initVal)
  }, [])
  
  const logOutHandler = async () => {
    await timRenderInstance.TIMLogout();
    dispatch(userLogout());
    window.localStorage.clear()
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
            <span>版本名称</span>
            <span>{description}</span>
          </div>
          <div className="setting-item">
            <span>版本信息</span>
            <span>V1.0.0</span>
          </div>
          <div className="setting-item">
            <span>版权所有</span>
            <span className="item-val">珠海华润银行</span>
          </div>
          <div className="setting-item">
            <span>文件存储</span>
            <span className="item-val">{pathurl}</span>
          </div>
          <div className="setting-item">
            <span>消息提示</span>
            <span className="item-val"> <Switch value={msgBother} onChange={(val) => setNewsMode(val)}></Switch></span>
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
