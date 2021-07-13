import React, { useState, useEffect } from 'react';

import { SearchBox } from '../../components/searchBox/SearchBox';
import { Tabs } from '@tencent/tea-component';
import { searchTextMessage,  searchGroup, searchFriends } from './api';


const TAB_LIST = [{
    id: 'contacter',
    label: '联系人'
},{
    id: 'group',
    label: '群组'
},{
    id: 'message',
    label: '消息'
}];

export const SearchMessage = () => {
    const [ activedId, setActivedId] = useState('contacter');
    const onActive = (tab) => {
        const { id } = tab;
        setActivedId(id);
    };

    useEffect(() => {
        searchTextMessage({
            keyWords: '你好呀'
        });

        searchGroup({
            keyWords: 'test'
        });
        searchFriends({
            keyWords: 'Jingfeng'
        })
    });

    return (
        <div className="search-message">
            <section className="search-message__input">
                <SearchBox />
            </section>
            <section className="search-message__tab">
                <Tabs tabs={TAB_LIST} activeId={activedId} onActive={onActive}/>
            </section>
            <section className="search-message__result">
                
            </section>
        </div>
    )
}