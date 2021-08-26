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
import { DOWNLOAD_PATH } from '../../../app/const/const'
const { ipcRenderer } = require("electron");
import Store   from "electron-store"
const store = new Store();
import { version, description} from '../../../../package.json'
import {
  recordShortcut_keydown,
  recordShortcut_keyup,
  registerShortcut,
} from "./ShortcutSetting";
export const AccountSetting = (): JSX.Element => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [pathurl, setPathUrl] = useState("");
  const [msgBother, setMsgBother] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const setNewsMode = (val) => {
    console.log(val, "val");
    setMsgBother(val);
    window.localStorage.setItem("msgBother", val);
  };
  const setKeyDown = (e) => {
    setInputValue(recordShortcut_keydown(e));
  };
  const setBlur = () => {
    registerShortcut(inputValue);
  };

  useEffect(() => {
    const initVal =
      window.localStorage.getItem("msgBother") == "true" ? true : false;
    setMsgBother(initVal);
  }, []);

  const logOutHandler = async () => {
    await timRenderInstance.TIMLogout();
    dispatch(userLogout());
    window.localStorage.clear();
    history.replace("/login");
    dispatch(setIsLogInAction(false));
    dispatch(clearConversation());
    dispatch(clearHistory());
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
            <span>{version}</span>
          </div>
          <div className="setting-item">
            <span>版权所有</span>
            <span className="item-val">珠海华润银行</span>
          </div>
          <div className="setting-item" onClick={()=> {
                  ipcRenderer.send('selectpath');
          }}>
            <span>文件存储</span>
            <span className="item-val">{
              store.get('setting')
            }</span>
          </div>
          <div className="setting-item">
            <span>消息提示</span>
            <span className="item-val">
              {" "}
              <Switch
                value={msgBother || ""}
                onChange={(val) => setNewsMode(val)}
              ></Switch>
            </span>
          </div>
          <div className="setting-item">
            <span>截图</span>
            <span className="item-val">
              <input
                className="setting-input"
                type="text"
                readOnly={true}
                onKeyDown={setKeyDown}
                onKeyUp={recordShortcut_keyup}
                onBlur={setBlur}
                value={inputValue || ""}
              />
            </span>
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
