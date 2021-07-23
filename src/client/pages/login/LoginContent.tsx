import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Tabs, TabPanel, Input, Button, Checkbox } from "tea-component";
import { DEFAULT_USERID, DEFAULT_USER_SIG} from '../../constants';
import timRenderInstance from '../../utils/timRenderInstance';
import { setIsLogInAction } from '../../store/actions/login';
import { changeFunctionTab } from '../../store/actions/ui';
// eslint-disable-next-line import/no-unresolved
import { loginParam } from 'im_electron_sdk/dist/interface';

import {filterGetDepartment,assemblyData} from '../../utils/orgin'
import { setUnreadCount } from '../../store/actions/section';

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
            //获取部门
            filterGetDepartment({
                DepId:"root_1"
            },(data)=>{
                let sectionData = assemblyData([data],'SubDepsInfoList','StaffInfoList','DepName','Uname')
                window.localStorage.setItem('section',JSON.stringify(sectionData))
                window.localStorage.setItem('uid',userID)
                dispatch(setUnreadCount(assemblyData([data],'SubDepsInfoList','StaffInfoList','DepName','Uname')))
                dispatch(setIsLogInAction(true));
                dispatch(changeFunctionTab('message'));
                history.replace('/home/message');
            },userID)
            // const  consoSection = await getDepartment({
            //     DepId:"root_1"
            // })
            // if(consoSection.status == 200){
            //     let sectionData = assemblyData([consoSection.data.DepInfo],'SubDepsInfoList','StaffInfoList','DepName','Uname')
            //     window.localStorage.setItem('section',JSON.stringify(sectionData))
            //     dispatch(setUnreadCount(assemblyData([consoSection.data.DepInfo],'SubDepsInfoList','StaffInfoList','DepName','Uname')))
            //     dispatch(setIsLogInAction(true));
            //     dispatch(changeFunctionTab('message'));
            //     history.replace('/home/message');
            // }
            
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