import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Tabs, TabPanel, Input, Button, Checkbox, message } from "tea-component";
import { DEFAULT_USERID, DEFAULT_USER_SIG, SDKAPPID, SECRETKEY, HUA_RUN_SYSTEMID } from '../../constants';
import timRenderInstance from '../../utils/timRenderInstance';
import { setIsLogInAction } from '../../store/actions/login';
import { changeFunctionTab } from '../../store/actions/ui';
// eslint-disable-next-line import/no-unresolved
import { loginParam } from 'im_electron_sdk/dist/interface';
import { getEncrptPwd } from '../../utils/addFriendForPoc'
import { getUserLoginInfo } from '../../services/login'
import { genTestUserSig } from './generateUserSig'
const tabs = [
    // {id: 'verifyCodeLogin', label: '验证码登陆'},
    { id: 'passwordLogin', label: '密码登陆' }
]


function errType(ERRCODE) {
    switch (ERRCODE) {
        case 'E001':
            return '用户名或密码不正确'
        case 'E002':
            return '账户被禁用'
        case 'E003':
            return '账户被锁定'
        case 'E004':
            return '账户密码过期'
        case 'E005':
            return '必传参数未正确传递'
        case 'E006':
            return '未查询到平台和系统，或者平台登录密码不正确'
        case 'E007':
            return '资源已经存在,不允许再次申请资源'
        case 'E008':
            return '资源已经存在,不允许再次申请资源'
        case 'E009':
            return '手机号匹配多个用户'
        case 'E010':
            return '资源类型或资源名称不存在'
        case 'E011':
            return '手机号不存在'
        case 'E999':
            return '未知错误'
        case 'E014':
            return '资源推送状态  已禁用'
        default:
            return '服务器错误'
    }
}

interface IEncrptPwdRes {
    ActionStatus: string;
    ErrorCode: number;
    Encypt: string;
    ErrorInfo: string;
}

export const LoginContent = (): JSX.Element => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [userID, setUserID] = useState(DEFAULT_USERID);
    // const [password, setPassword] = useState(DEFAULT_USER_SIG);
    const [password, setPassword] = useState('7798_test');
    const isDisablelogin = userID && password;

    const customizeTabBarRender = (children: JSX.Element) => {
        return <a className="customize-tab-bar">{children}</a>
    }

    const handleLoginClick = async () => {
        getEncrptPwd({
            Pwd: password
        }).then(getEncrptPwdRes => {
            const { Encypt } = getEncrptPwdRes as unknown as IEncrptPwdRes

            getUserLoginInfo({
                systemid: HUA_RUN_SYSTEMID,
                userName: userID.toUpperCase(),
                userPass: Encypt,
                asyuserind: null,
                password: 'MTIzNDU2'
            }).then(async res => {
                const { USERLOGIN } = res.data
                const { userSig } = genTestUserSig(USERLOGIN.toUpperCase(), SDKAPPID, SECRETKEY)
                const params: loginParam = {
                    userID: USERLOGIN.toUpperCase(),
                    userSig: userSig
                }
                const { data: { code, data, desc, json_param } } = await timRenderInstance.TIMLogin(params);
                console.log(code, data, desc, json_param);
                if (code === 0) {
                    dispatch(setIsLogInAction(true));
                    dispatch(changeFunctionTab('message'));
                    history.replace('/home/message');
                }
            }).catch(err => {
                const { ERRCODE } = err.data
                message.error({
                    content: "登录失败：" + err.message || errType(ERRCODE),
                })
            })
        }).catch(err => {
            message.error({
                content: "登录失败：" + err.message || err.ErrorInfo,
            })
        })

    }

    return (
        <div className="login--context">
            <h2 className="login--context__title">登陆IM</h2>
            <Tabs tabs={tabs} placement="top" tabBarRender={customizeTabBarRender}>
                <TabPanel id="verifyCodeLogin">
                    <Input placeholder="请输入用户名" className="login--input" />
                    <Input placeholder="请输入密码" className="login--input" />
                </TabPanel>
                {/* <TabPanel id="passwordLogin">
                    <Input placeholder="请输入userid" value={userID} className="login--input" onChange={(val) => { setUserID(val)}} />
                    <Input placeholder="请输入usersig"  value={usersig} className="login--input" onChange={(val) => setUserSig(val)} />
                </TabPanel> */}
                <TabPanel id="passwordLogin">
                    <Input placeholder="请输入userid" value={userID} className="login--input" onChange={(val) => { setUserID(val) }} />
                    <Input placeholder="请输入密码" value={password} className="login--input" onChange={(val) => setPassword(val)} />
                </TabPanel>
            </Tabs>
            <Checkbox display="block" value={false} className="login--auto">
                下次自动登录
            </Checkbox>
            <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}> 登陆</Button>
        </div>
    )
}