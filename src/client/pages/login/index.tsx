import React, { FC, useState } from 'react';
import { RouteComponentProps } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { Tabs, TabPanel, Input, Button, Checkbox } from "@tencent/tea-component";
import timRenderInstance from '../../utils/timRenderInstance';

import { DEFAULT_UID, DEFAULT_USER_SIG} from '../../constants'
import { LoginAbout } from './LoginAbout';
import './login.scss';
// eslint-disable-next-line import/no-unresolved
import { loginParam } from 'im_electron_sdk/dist/interface';

import { setIsLogInAction } from '../../store/actions/login';

type Props = RouteComponentProps

export const Login: FC<Props> = ({ history }) => {
    const [sdkAppid, setSdkAppid] = useState(DEFAULT_UID);
    const [usersig, setUserSig] = useState(DEFAULT_USER_SIG);
    const dispatch = useDispatch();

    const handleLoginClick = async () => {
        const params:loginParam = {
            userID: sdkAppid,
            userSig: usersig
        }
        const { data: { code,data,desc,json_param }} = await timRenderInstance.TIMLogin(params);
        console.log(code,data,desc,json_param)
        if(code === 0) {
            dispatch(setIsLogInAction(true));
            history.replace('/home/message');
        }
    }

    const tabs = [
        {id: 'verifyCodeLogin', label: '验证码登陆'},
        {id: 'passwordLogin', label: '密码登陆'}
    ]

    const customizeTabBarRender = (children: JSX.Element) => {
        return <a className="customize-tab-bar">{children}</a>
    }

    const isDisablelogin = sdkAppid && usersig;

    return (
        <div className="login">
            <div className="login--about">
                <LoginAbout></LoginAbout>
            </div>
                <div className="login--context">
                    <h2 className="login--context__title">登陆IM</h2>
                    <Tabs tabs={tabs} placement="top" tabBarRender={customizeTabBarRender}>
                        <TabPanel id="verifyCodeLogin">
                            <Input placeholder="请输入用户名" className="login--input" />
                            <Input placeholder="请输入密码" className="login--input" />
                        </TabPanel>
                        <TabPanel id="passwordLogin">
                            <Input placeholder="请输入userid" value={sdkAppid} className="login--input" onChange={(val) => { setSdkAppid(val)}} />
                            <Input placeholder="请输入usersig"  value={usersig} className="login--input" onChange={(val) => setUserSig(val)} />
                        </TabPanel>
                    </Tabs>
                    <Checkbox display="block" value={false} className="login--auto">
                        下次自动登录
                    </Checkbox>
                    <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}> 登陆</Button>
                </div>
        </div>
    )
}