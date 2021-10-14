import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'tea-component';
import { useHistory } from "react-router-dom";

import timRenderInstance from '../../utils/timRenderInstance';
import { setIsLogInAction, userLogout } from '../../store/actions/login';
import { clearConversation } from '../../store/actions/conversation';
import { clearHistory } from '../../store/actions/message';
import { updateHistoryMessageToStore } from '../../utils/LocalStoreInstance';


export const AccountSetting = (): JSX.Element => {
    const history = useHistory();
    const dispatch = useDispatch();

    const logOutHandler = async () => {
        await timRenderInstance.TIMLogout();
        updateHistoryMessageToStore();
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
                <span className="connect-header--text">账号设置</span>
            </header>
            <section className="connet-section">
                {/* <div className="connect-desc">
                    <p>
                        简单接入，稳定必答、覆盖全球的即时通信云服务
                    </p>
                </div> */}
                <Button onClick={logOutHandler} style={{ fontSize: "16px",width:"200px",height:"40px",margin: "auto",marginLeft:"30%",marginTop:"20%" }}>退出登录</Button>
            </section>
        </div>
    )
}