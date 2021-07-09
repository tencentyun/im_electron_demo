import React from 'react';

import { LoginAbout } from './LoginAbout';
import { LoginContent } from './LoginContent';
import './login.scss';

export const Login = (): JSX.Element => (
    <div className="login">
        <LoginAbout></LoginAbout>
        <LoginContent></LoginContent>
    </div>
)