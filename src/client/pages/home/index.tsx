import React, { useState } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Avatar } from '../../components/avatar/avatar';

import { Message } from '../Message';
import { RelationShip } from '../relationship/relationship';
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
    // {
    //     id: 'settings',
    //     title: '设置',
    //     address: '/home/setting',
    // }
]

export const Home = (): JSX.Element => {
    const [activedId, setActiveId] = useState('message');
    const { faceUrl } = useSelector((state: State.RootState) => state.userInfo);

    const addActiveClass = (id: string) : string => activedId === id ? 'is-active' : '';

    const handleLinkClick = (id: string): void => setActiveId(id);

    return <div className="home">
        
        <div className="nav">
            {/* 头像 */}
            <Avatar
                url={ faceUrl }
                extralClass="userinfo-avatar"
            />
            {/* 菜单 */}
            {
                navList.map(({id, address}) => {
                    return (
                        <div className='nav--item' key={id}>
                            <Link to={address} className={`nav--link ${id} ${addActiveClass(id)}`} onClick={() => handleLinkClick(id)} />
                        </div>
                    )
                })
            }
            {/* 设置 */}
            <div className='nav--item'>
                <Link to="/home/setting" className={`nav--link settings ${addActiveClass('settings')}`} onClick={() => handleLinkClick('settings')}/>
            </div>
        </div>
        <div className="content">
            <Switch>
                <Route path="/home/message" component={Message}></Route>
                <Route path="/home/connection" component={RelationShip}></Route>
                <Route path="/home/setting" component={Setting}></Route>
            </Switch>
        </div>
    </div>
}