import React, { useEffect, useState } from 'react';
import { Link, Switch, Route, useLocation } from 'react-router-dom';


import { Message } from '../message/index';
import { RelationShip } from '../relationship/relationship';
import { CalendarComponent } from '../calendar/index';
import { OfficialComponent } from '../official/index';

import { Setting } from '../settings/Setting';

import './home.scss';
import { UnreadCount } from './unreadCount';
import { Profile } from './profile';
import { useDispatch, useSelector } from 'react-redux';
import { changeFunctionTab } from '../../store/actions/ui';
import { Organization } from '../organization/organization';

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
        id: 'calendar',
        title: '日历',
        address: '/home/calendar',

    },
    {
        id: 'official',
        title: '公众号',
        address: '/home/official',

    }
    // {
    //     id: 'settings',
    //     title: '设置',
    //     address: '/home/setting',
    // }
]

export const Home = (): JSX.Element => {
    const { function_tab } = useSelector((state: State.RootState) => state.ui);

    const location =  useLocation();
    const path = location?.pathname;

    const currentId = {
        '/home/message': 'message',
        '/home/connection': 'contacts',
        '/home/calendar': 'calendars',
        '/home/official': 'officials',
        '/home/setting': 'settings',
    }[path] || 'message';

    const dispatch = useDispatch();
    
    const addActiveClass = (id: string) : string => function_tab === id ? 'is-active' : '';

    const handleLinkClick = (id: string) => dispatch(changeFunctionTab(id));

    useEffect(() => {
        dispatch(changeFunctionTab(currentId))
    }, [])

    return <div className="home">
        
        <div className="nav">
            {/* 头像以及个人信心 */}
            <Profile />
            {/* 菜单 */}
            {
                navList.map(({id, address}) => {
                    return (
                        <div className='nav--item' key={id}>
                            {/* 会话未读的小红点 */}
                            {
                                id === 'message' ? <UnreadCount /> : null
                            }
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
                <Route path="/home/calendar" component={CalendarComponent}></Route>
                <Route path="/home/official" component={OfficialComponent}></Route>
                <Route path="/home/setting" component={Setting}></Route>
                <Route path="/home/organization" component={Organization}></Route>
            </Switch>
        </div>
    </div>
}