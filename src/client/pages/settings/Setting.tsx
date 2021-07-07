import React, { FC, useState } from 'react';
import { RouteComponentProps } from "react-router-dom";

import { AccountSetting } from './AccountSetting';
import { CommonSetting } from './CommonSetting';
import { FileManager } from './FileManager';
import { ConnectUs } from './ConnectUs';
import { SearchBox } from '../../components/SearchBox';

import './setting.scss';


type Props = RouteComponentProps

const settingsConfig = [
    {
        id: 'accountSetting',
        name: '账号设置',
        component: AccountSetting()
    },
    {
        id: 'commonSetting',
        name: '通用设置',
        component: CommonSetting()
    },
    {
        id: 'fileManager',
        name: '文件管理',
        component: FileManager()
    },
    {
        id: 'connectUs',
        name: '联系我们',
        component: ConnectUs()
    }
]

export const Setting: FC<Props> = () => {
    const [activedId,  setActiveId] = useState('accountSetting');


    const getDisplayComponent = () => settingsConfig.find((item) => item.id === activedId)?.component;

    const handleNavClick = (id: string): void => setActiveId(id);

    const addActiveClass = (id: string): string => id === activedId ? 'is-active' : '';

    return (
        <div className="settings">
            <div className="settings-nav">
                <div className="settings-search">
                    <SearchBox />
                </div>
                {
                    settingsConfig.map(({id, name}) => {
                        return (
                            <li className={`settings-nav--item ${addActiveClass(id)}`} key={id} onClick={() => handleNavClick(id)}>
                                <span className={`settings-nav--item__icon ${id}`} />
                                <span className="settings-nav--item__name">{name}</span>
                            </li>
                        )
                    })
                }
            </div>
            <div className="settings-content">
                {
                    getDisplayComponent()
                }
            </div>
        </div>
    )
}