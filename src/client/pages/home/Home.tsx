import React, {useState} from 'react';
import { Link, Switch, Route } from 'react-router-dom';

import { Connection } from '../Connection';
import { Message } from '../Message';
import { Setting } from '../settings/Setting';

import './home.scss';

const navList = [
    {
        id: 'message',
        title: '消息',
        address: '/home/message',
    },
    {
        id: 'contacts',
        title: '通讯录',
        address: '/home/connection',

    },
    {
        id: 'settings',
        title: '设置',
        address: '/home/setting',
    }
]

export const Home = (): JSX.Element => {
    const [activedId, setActiveId] = useState('message')

    const addActiveClass = (id: string) : string => activedId === id ? 'is-active' : '';

    const handleLinkClick = (id: string): void => setActiveId(id);

    return <div className="home">
        <div className="nav">
            {
                navList.map(({id, address}) => {
                    return (
                        <li className='nav--item' key={id}>
                            <Link to={address} className={`nav--link ${id} ${addActiveClass(id)}`} onClick={() => handleLinkClick(id)} />
                        </li>
                    )
                })
            }
        </div>
        <div className="content">
            <Switch>
                <Route path="/home/message" component={Message}></Route>
                <Route path="/home/connection" component={Connection}></Route>
                <Route path="/home/setting" component={Setting}></Route>
            </Switch>
        </div>
    </div>
}