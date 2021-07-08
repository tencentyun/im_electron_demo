import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@tencent/tea-component';
import { useHistory } from "react-router-dom";

import timRenderInstance from '../../utils/timRenderInstance';
import { setIsLogInAction } from '../../store/actions/login';


export const AccountSetting = (): JSX.Element => {
    const history = useHistory();
    const dispatch = useDispatch();

    const logOutHandler = async () => {
        await timRenderInstance.TIMLogout();
        history.replace('/login');
        dispatch(setIsLogInAction(false));
    };
    return (
        <div className="account-setting">
            <Button onClick={logOutHandler}>退出登录</Button>
        </div>
    )
}