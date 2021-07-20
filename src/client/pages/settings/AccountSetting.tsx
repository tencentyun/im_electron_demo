import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'tea-component';
import { useHistory } from "react-router-dom";

import timRenderInstance from '../../utils/timRenderInstance';
import { setIsLogInAction, userLogout } from '../../store/actions/login';


export const AccountSetting = (): JSX.Element => {
    const history = useHistory();
    const dispatch = useDispatch();

    const logOutHandler = async () => {
        await timRenderInstance.TIMLogout();
        dispatch(userLogout());
        history.replace('/login');
        dispatch(setIsLogInAction(false));
    };
    return (
        <div className="account-setting">
            <Button onClick={logOutHandler}>退出登录</Button>
        </div>
    )
}