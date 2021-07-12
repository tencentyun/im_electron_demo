import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Tabs, TabPanel, Input, Button, Checkbox } from "@tencent/tea-component";
import { DEFAULT_USERID, DEFAULT_USER_SIG} from '../../constants';
import timRenderInstance from '../../utils/timRenderInstance';
import { setIsLogInAction } from '../../store/actions/login';
// eslint-disable-next-line import/no-unresolved
import { loginParam } from 'im_electron_sdk/dist/interface';

const tabs = [
    {id: 'verifyCodeLogin', label: '验证码登陆'},
    {id: 'passwordLogin', label: '密码登陆'}
]

export const LoginContent = (): JSX.Element => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [userID, setUserID] = useState(DEFAULT_USERID);
    const [usersig, setUserSig] = useState(DEFAULT_USER_SIG);
    const isDisablelogin = userID && usersig;

    const customizeTabBarRender = (children: JSX.Element) => {
        return <a className="customize-tab-bar">{children}</a>
    }

    const handleLoginClick = async () => {
        const params:loginParam = {
            userID: userID,
            userSig: usersig
        }
        const { data: { code,data,desc,json_param }} = await timRenderInstance.TIMLogin(params);
        console.log(code,data,desc,json_param);
        if(code === 0) {
            dispatch(setIsLogInAction(true));
            history.replace('/home/message');
        }
    }

    return (
        <div className="login--context">
            <h2 className="login--context__title">登陆IM</h2>
            <Tabs tabs={tabs} placement="top" tabBarRender={customizeTabBarRender}>
                <TabPanel id="verifyCodeLogin">
                    <Input placeholder="请输入用户名" className="login--input" />
                    <Input placeholder="请输入密码" className="login--input" />
                </TabPanel>
                <TabPanel id="passwordLogin">
                    <Input placeholder="请输入userid" value={userID} className="login--input" onChange={(val) => { setUserID(val)}} />
                    <Input placeholder="请输入usersig"  value={usersig} className="login--input" onChange={(val) => setUserSig(val)} />
                </TabPanel>
            </Tabs>
            <Checkbox display="block" value={false} className="login--auto">
                下次自动登录
            </Checkbox>
            <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}> 登陆</Button>
        </div>
    )
}