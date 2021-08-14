import React from 'react';

import { LoginAbout } from './LoginAbout';
import { LoginContent } from './LoginContent';
import './login.scss';
import { Windows } from '../../components/toolsBar/windows';

export const Login = (): JSX.Element => (
    <div>
        <div className="login">
            <LoginAbout></LoginAbout>
            <LoginContent></LoginContent>
        </div>
    </div>

)