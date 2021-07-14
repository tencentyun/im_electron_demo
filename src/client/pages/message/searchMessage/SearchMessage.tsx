import React, { useState, useEffect } from 'react';

import { Tabs, TabPanel, Input, Icon } from '@tencent/tea-component';
import { searchTextMessage,  searchGroup, searchFriends } from '../api';
import { GroupResult } from './GroupResult';
import { ContacterResult } from './ContacterResult';
import { MessageResult } from './MessageResult';

import './search-message.scss';

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
    const [ searchResult, setSearchResult ] = useState({
        messageResult: {},
        groupResult: [],
        friendsResult: []
    });

    useEffect(() => {
        const messageResult = searchTextMessage({
            keyWords: '11'
        });

        const groupResult = searchGroup({
            keyWords: 'test'
        });
        
        const friendsResult = searchFriends({
            keyWords: 'Jingfeng'
        });

        Promise.all([messageResult, groupResult, friendsResult]).then(searchResult => {
            const [messageResult, groupResult, friendsResult] = searchResult;
            setSearchResult({
                messageResult,
                groupResult,
                friendsResult
            });
        });
    }, []);

    return (
        <div className="search-message">
            <section className="search-message__input-area">
                <Icon className="search-message__input-area--icon" type="search" />
                <Input className="search-message__input-area--input" type="search" placeholder="查找消息、文档等" />
                <Icon className="search-message__input-area--icon-close" type="close" />
            </section>
            <section className="search-message__tab">
                <Tabs tabs={TAB_LIST} >
                    <TabPanel id="contacter">
                        <ContacterResult result={searchResult.friendsResult}/>
                    </TabPanel>
                    <TabPanel id="group">
                        <GroupResult result={searchResult.groupResult}/>
                    </TabPanel>
                    <TabPanel id="message">
                        <MessageResult result={searchResult.messageResult}/>
                    </TabPanel>
                </Tabs>
            </section>
        </div>
    )
}