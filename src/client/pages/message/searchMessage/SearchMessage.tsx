import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';

import { Tabs, TabPanel, Input, Icon } from '@tencent/tea-component';
import { searchTextMessage,  searchGroup, searchFriends } from '../api';
import { GroupResult } from './GroupResult';
import { ContacterResult } from './ContacterResult';
import { MessageResult } from './MessageResult';

import './search-message.scss';

export const SearchMessage = (props) => {
    const [ inputValue, setInputValue] = useState("");
    const [ searchResult, setSearchResult ] = useState({
        messageResult: {
            msg_search_result_total_count: 0
        },
        groupResult: [],
        friendsResult: []
    });

    useEffect(() => {
        if(inputValue) {
            const messageResult = searchTextMessage({
                keyWords: inputValue
            });
    
            const groupResult = searchGroup({
                keyWords: inputValue
            });
            
            const friendsResult = searchFriends({
                keyWords: inputValue
            });
    
            Promise.all([messageResult, groupResult, friendsResult]).then(searchResult => {
                const [messageResult, groupResult, friendsResult] = searchResult;
                setSearchResult({
                    messageResult,
                    groupResult,
                    friendsResult
                });
            });
        } else {
            setSearchResult({
                messageResult: {
                    msg_search_result_total_count: 0
                },
                groupResult: [],
                friendsResult: []
            })
        }
    }, [inputValue]);

    const setValue = (value) => {
        setInputValue(value);
    }

    const handleInoputOnchange = debounce(setValue, 300);

    const handleModalClose = () => props.close();

    const generateTabList = () => {
        const { friendsResult, messageResult, groupResult } = searchResult;
        const tabList = [{
            id: 'contacter',
            label: `联系人(${friendsResult.length})`
        },{
            id: 'group',
            label: `群组(${groupResult.length})`
        },{
            id: 'message',
            label: `消息(${messageResult.msg_search_result_total_count})`
        }];

        return tabList;
    }

    return (
        <div className="search-message">
            <section className="search-message__input-area">
                <Icon className="search-message__input-area--icon" type="search" />
                <Input className="search-message__input-area--input" type="search" placeholder="查找消息、文档等" onChange={handleInoputOnchange}/>
                <Icon className="search-message__input-area--icon-close" type="close" onClick={handleModalClose}/>
            </section>
            <section className="search-message__tab">
                <Tabs tabs={generateTabList()} >
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