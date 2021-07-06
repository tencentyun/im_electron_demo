import React, { FC, useState } from 'react';
import { RouteComponentProps } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import { Tabs, TabPanel, Input, Button, Card } from "@tencent/tea-component";
import {incrementAction, decrementAction} from '../store/actions';
import timRenderInstance from '../utils/timRenderInstance';


import './login.scss';

type Props = RouteComponentProps
const defaultUserId = "3708";

const defaultUserSig= "eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS80oy0zLBwsbmBhZQ8eKU7MSCgswUJStDEwMDQwtzY1MjiExqRUFmUSpQ3NTU1MjAwAAiWpKZCxIzMzKxNDU3NjGDmpKZDjQ2LKnAz6Q0J9s3LdQsSrvA28kvKinY1LvIOdE9yDk13DEp0SIi2zWtND*53FapFgB-kjCC";



export const Login: FC<Props> = ({ history }) => {
    const dispatch = useDispatch();
    const [sdkAppid, setSdkAppid] = useState(defaultUserId);
    const [usersig, setUserSig] = useState(defaultUserSig);

    const number = useSelector(state => state);

    const handleLoginClick = async () => {
        const params = {
            userID: sdkAppid,
            userSig: usersig
        }
        const {data: {code}} = await timRenderInstance.TIMLogin(params);
        if(code === 0) {
            history.replace('/home')
        }
    }

    const handleIncrement = () => {
        dispatch(incrementAction);
    };

    const handleDecrement = () => {
        dispatch(decrementAction);
    };

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
                            <Input placeholder="请输入用户名" className="login--input"></Input>
                            <Input placeholder="请输入密码" className="login--input"></Input>
                        </TabPanel>
                        <TabPanel id="passwordLogin">
                            <Input placeholder="请输入userid" value={sdkAppid} className="login--input" onChange={(val) => { setSdkAppid(val)}}></Input>
                            <Input placeholder="请输入usersig"  value={usersig} className="login--input" onChange={(val) => setUserSig(val)}></Input>
                        </TabPanel>
                    </Tabs>
                    <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}> 登陆</Button>
                </div>
            </Card>
        </div>
    )
}