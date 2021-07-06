import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';

import { Connection } from './Connection';
import { Message } from './Message'
import { Setting } from './Setting'


export const Home = () => {
    return <div>
        <div className="menu-list">
            <li>
                <Link to="/home/message">会话</Link>
            </li>
            <li>
                <Link to="/home/connection">通讯录</Link>
            </li>
            <li>
                <Link to="/home/setting">设置</Link>
            </li>
        </div>
        <div className="container">
            <Switch>
                <Route path="/home/message" component={Message}></Route>
                <Route path="/home/connection" component={Connection}></Route>
                <Route path="/home/setting" component={Setting}></Route>
            </Switch>
        </div>
    </div>
}