import React, { FC, useState } from 'react';
import { RouteComponentProps } from "react-router-dom";

import { Tabs, TabPanel, Input, Button, Card } from "@tencent/tea-component";
import timRenderInstance from '../utils/timRenderInstance';

import { DEFAULT_UID, DEFAULT_USER_SIG} from '../constants'
import './login.scss';
// eslint-disable-next-line import/no-unresolved
import { loginParam } from 'im_electron_sdk/dist/interface';

type Props = RouteComponentProps

export const Login: FC<Props> = ({ history }) => {
    const [sdkAppid, setSdkAppid] = useState(DEFAULT_UID);
    const [usersig, setUserSig] = useState(DEFAULT_USER_SIG);

    const handleLoginClick = async () => {
        const params:loginParam = {
            userID: sdkAppid,
            userSig: usersig
        }
        const { data: { code,data,desc,json_param }} = await timRenderInstance.TIMLogin(params);
        console.log(code,data,desc,json_param)
        if(code === 0) {
            history.replace('/home/message')
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
                Login about
            </div>
            <Card>
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
                    <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}> 登陆</Button>
                </div>
            </Card>
        </div>
    )
}