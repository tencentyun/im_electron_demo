import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Tabs, TabPanel, Input, Button, Checkbox, message } from "tea-component";
import { SDKAPPID, SECRETKEY } from '../../constants';
import timRenderInstance from '../../utils/timRenderInstance';
import { setIsLogInAction } from '../../store/actions/login';
import { changeFunctionTab } from '../../store/actions/ui';
import { setUserInfo } from '../../store/actions/user';
import { loginUser } from '../../store/actions/loginUser';
import { loginParam } from 'im_electron_sdk/dist/interface';
import { filterGetDepartment, assemblyData } from '../../utils/orgin'
import { setUnreadCount } from '../../store/actions/section';
import { getEncrptPwd } from '../../utils/addFriendForPoc'
import { getUserLoginInfo } from '../../services/login'
import { genTestUserSig } from './generateUserSig'
import getHuaRunConfig from '../../constants'
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
    const [userID, setUserID] = useState(window.localStorage.getItem('uid') || '');
    const [password, setPassword] = useState('');
    const isDisablelogin = userID && password;

    const customizeTabBarRender = (children: JSX.Element) => {
        return <a className="customize-tab-bar">{children}</a>
    }
    const chkIt = (val: string) => {
        if (val.length === 0) {
            setUserID('')
            setPassword('')
            window.localStorage.setItem('uid', '')
            window.localStorage.setItem('usersig', '')
        }
        if (val.length > 0 && !/^[A-Za-z0-9-]+$/.test(val)) {
            message.warning({ content: '不能输入中文！' })
            return
        }
        setUserID(val.toLocaleUpperCase())
    }
    const handleLoginClick = async () => {
        getEncrptPwd({
            Pwd: password
        }).then(async getEncrptPwdRes => {
            const { Encypt } = getEncrptPwdRes as unknown as IEncrptPwdRes
            console.log(Encypt)
            
            const env = process.env.huarun_env
            let USERLOGIN;
            if(env=='prod'){
                const res = await getUserLoginInfo({
                    systemid: getHuaRunConfig.HUA_RUN_SYSTEMID,
                    userName: userID.toUpperCase(),
                    userPass: Encypt,
                    asyuserind: null,
                    password: "MTIzNDU2"
                })
    
                const { RET, USERLOGIN:user, ERRCODE } = res
                if (RET === 'FALSE') {
                    message.error({
                        content: "登录失败：" + errType(ERRCODE),
                    })
                } else {
                   USERLOGIN = user;
                }
            }else{
                USERLOGIN = userID
            }
            const { userSig } = genTestUserSig(USERLOGIN.toUpperCase(), SDKAPPID, SECRETKEY)
            const params: loginParam = {
                userID: USERLOGIN.toUpperCase(),
                userSig: userSig
            }
            const { data: { code, data, desc, json_param } } = await timRenderInstance.TIMLogin(params);
            window.localStorage.setItem('uid', USERLOGIN)
            window.localStorage.setItem('usersig', Encypt)
            //获取部门
            filterGetDepartment({
                DepId: "root_1"
            }, (data) => {
                let sectionData = assemblyData([data], 'SubDepsInfoList', 'StaffInfoList', 'DepName', 'Uname')[0].children
                window.localStorage.setItem('section', JSON.stringify(sectionData))
                dispatch(setUserInfo({
                    userId: USERLOGIN,
                    userSig: userSig
                }));
                dispatch(setUnreadCount(assemblyData([data], 'SubDepsInfoList', 'StaffInfoList', 'DepName', 'Uname')[0].children))
                dispatch(setIsLogInAction(true));
                dispatch(changeFunctionTab('message'));
                history.replace('/home/message');
            }, USERLOGIN)
        }).catch(err => {
            message.error({
                content: "登录失败：" + err.message || err.ErrorInfo,
            })
        })

    }

    return (
        <div className="login--context">
            <h2 className="login--context__title">员工登录</h2>
            <Input placeholder="请输入UM用户名" value={userID} className="login--input" onChange={chkIt} />
            <Input placeholder="请输入UM密码" type="password" value={password} className="login--input" onChange={(val) => setPassword(val)} />
            
            {/* <Tabs tabs={tabs} placement="top" tabBarRender={customizeTabBarRender}>
                <TabPanel id="passwordLogin">
                    <Input placeholder="请输入userid" value={userID} className="login--input" onChange={chkIt} />
                    <Input placeholder="请输入密码" type="password" value={password} className="login--input" onChange={(val) => setPassword(val)} />
                </TabPanel>
            </Tabs> */}
            {/* <Checkbox display="block" value={false} className="login--auto">
                下次自动登录
            </Checkbox> */}
            <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}>登录</Button>
        </div>
    )
}


// 原本的登录
// export const LoginContent = (): JSX.Element => {
//     const dispatch = useDispatch();
//     const history = useHistory();
//     const [activedTab, setActivedTab] = useState('passwordLogin');
//     const [userID, setUserID] = useState(DEFAULT_USERID);
//     const [usersig, setUserSig] = useState(DEFAULT_USER_SIG);
//     const isDisablelogin = activedTab === 'passwordLogin' && userID && usersig;
//     console.log("自动更新1")
//     document.addEventListener('DOMContentLoaded', () => {
//         console.log("自动更新2")
//         const { ipcRenderer } = require('electron');
//         ipcRenderer.on('message', (event, { message, data }) => {
//             console.log("自动更新进入")
//             console.log(message, data);
//             switch (message) {
//                 case 'isUpdateNow':
//                     if (confirm('发现有新版本，是否现在更新？')) {
//                         ipcRenderer.send('updateNow');
//                     }
//                     break;
//                 default:
//                     //document.querySelector('h1').innerHTML = message;
//                     break;
//             }
//         })
//     })
//     const customizeTabBarRender = (children: JSX.Element) => {
//         return <a className="customize-tab-bar">{children}</a>
//     }

//     const handleTabChange = ({ id }) => {
//         if (id === 'verifyCodeLogin') return message.warning({ content: '敬请期待' });
//         setActivedTab(id);
//     }

//     const handleLoginClick = async () => {
//         const params: loginParam = {
//             userID: userID,
//             userSig: usersig
//         }
//         const { data: { code, data, desc, json_param } } = await timRenderInstance.TIMLogin(params);
//         console.log(code, data, desc, json_param);
//         if (code === 0) {
//             dispatch(setIsLogInAction(true));
//             dispatch(setUserInfo({
//                 userId: userID,
//                 faceUrl: '', gender: '', nickName: '', role: null
//             }));
//             dispatch(changeFunctionTab('message'));
//             history.replace('/home/message');
//         }
//     }

//     return (
//         <div className="login--context">
//             <h2 className="login--context__title">登陆IM</h2>
//             <Tabs tabs={tabs} placement="top" activeId={activedTab} onActive={handleTabChange} tabBarRender={customizeTabBarRender}>
//                 <TabPanel id="verifyCodeLogin">
//                     <Input placeholder="请输入用户名" className="login--input" />
//                     <Input placeholder="请输入密码" className="login--input" />
//                 </TabPanel>
//                 <TabPanel id="passwordLogin">
//                     <Input placeholder="请输入userid" value={userID} className="login--input" onChange={(val) => { setUserID(val) }} />
//                     <Input placeholder="请输入usersig" value={usersig} className="login--input" onChange={(val) => setUserSig(val)} />
//                 </TabPanel>
//             </Tabs>
//             {/* <Checkbox display="block" value={false} className="login--auto">
//                 下次自动登录
//             </Checkbox> */}
//             <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}> 登陆</Button>
//         </div>
//     )
// }


// 原本的登录
// export const LoginContent = (): JSX.Element => {
//     const dispatch = useDispatch();
//     const history = useHistory();
//     const [activedTab, setActivedTab] = useState('passwordLogin');
//     const [userID, setUserID] = useState(DEFAULT_USERID);
//     const [usersig, setUserSig] = useState(DEFAULT_USER_SIG);
//     const isDisablelogin = activedTab === 'passwordLogin' && userID && usersig;
//     console.log("自动更新1")
//     document.addEventListener('DOMContentLoaded', () => {
//       console.log("自动更新2")
//       const { ipcRenderer } = require('electron');
//       ipcRenderer.on('message', (event, { message, data }) => {
//         console.log("自动更新进入")
//         console.log(message, data);
//         switch (message) {
//           case 'isUpdateNow':
//             if (confirm('发现有新版本，是否现在更新？')) {
//               ipcRenderer.send('updateNow');
//             }
//             break;
//           default:
//             //document.querySelector('h1').innerHTML = message;
//             break;
//         }
//       })
//     })
//     const customizeTabBarRender = (children: JSX.Element) => {
//         return <a className="customize-tab-bar">{children}</a>
//     }

//     const handleTabChange = ({id}) => {
//         if(id === 'verifyCodeLogin') return message.warning({content: '敬请期待'});
//         setActivedTab(id);
//     }

//     const handleLoginClick = async () => {
//         const params:loginParam = {
//             userID: userID,
//             userSig: usersig
//         }
//         const { data: { code,data,desc,json_param }} = await timRenderInstance.TIMLogin(params);
//         console.log(code,data,desc,json_param);
//         if(code === 0) {
//             dispatch(setIsLogInAction(true));
//             dispatch(setUserInfo({
//                 userId: userID
//             }));
//             dispatch(changeFunctionTab('message'));
//             history.replace('/home/message');
//         }
//     }

//     const chkIt = (val: string) => {
//         if (val.length > 0 && !/^[A-Za-z0-9]+$/.test(val)) {
//             message.warning({content:'不能输入中文！'})
//             return
//         }
//         setUserID(val.toLocaleUpperCase())
//     }


//     return (
//         <div className="login--context">
//             <h2 className="login--context__title">登陆IM</h2>
//             <Tabs tabs={tabs} placement="top" activeId={activedTab} onActive={handleTabChange} tabBarRender={customizeTabBarRender}>
//                 <TabPanel id="verifyCodeLogin">
//                     <Input placeholder="请输入用户名" className="login--input" />
//                     <Input placeholder="请输入密码" className="login--input" />
//                 </TabPanel>
//                 <TabPanel id="passwordLogin">
//                     <Input placeholder="请输入userid" value={userID} className="login--input" onChange={chkIt} />
//                     <Input placeholder="请输入usersig" type="password"  value={usersig} className="login--input" onChange={(val) => setUserSig(val)} />
//                 </TabPanel>
//             </Tabs>
//             {/* <Checkbox display="block" value={false} className="login--auto">
//                 下次自动登录
//             </Checkbox> */}
//             <Button type="primary" className="login--button" onClick={handleLoginClick} disabled={!isDisablelogin}> 登陆</Button>
//         </div>
//     )
// }
