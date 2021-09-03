import React from 'react';

import { LoginAbout } from './LoginAbout';
import { LoginContent } from './LoginContent';
import './login.scss';
import { ToolsBar } from '../../components/toolsBar/toolsBar';
export const Login = (): JSX.Element => (
    <div style={{width: "100%",height: "100%" }}>
        <ToolsBar ></ToolsBar>
        <div className="login">
            <LoginAbout></LoginAbout>
            <LoginContent></LoginContent>
        </div>
    </div>

)