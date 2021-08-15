import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';

import { Tabs, TabPanel, Input, Icon } from 'tea-component';
import { searchTextMessage, searchGroup, searchFriends, addProfileForConversition } from '../api';
import { GroupResult } from './GroupResult';
import { ContacterResult } from './ContacterResult';
import { MessageResult } from './MessageResult';

import './search-message.scss';
import { getstAffPrefix } from '../../../utils/orgin';
import { ContactResult } from './ContactResult';

export const SearchMessage = (props) => {
    const [inputValue, setInputValue] = useState("");
    const [searchResult, setSearchResult] = useState({
        messageResult: [],
        groupResult: [],
        friendsResult: [],
        contactResult: []
    });
    const searchContact = (inputValue):any => {
       return new Promise<any>((resolve) => {
            getstAffPrefix({
                Prefix: inputValue,
                Limit: 100
            }).then(data => {
                if(data && data.data && data.data.StaffInfoList){
                    resolve(data.data.StaffInfoList)
                }else{
                    resolve([])
                }
                
            }).catch(()=>{
                resolve([])
            })
        })
    }
    useEffect(() => {
        if (inputValue.trim()) {
            const messageResult = searchTextMessage({
                keyWords: inputValue
            });

            const groupResult = searchGroup({
                keyWords: inputValue
            });

            const friendsResult = searchFriends({
                keyWords: inputValue
            });
            const searchContactResult = searchContact(inputValue)
            
            const addProfileForMessageResult = async () => {
                const msgResult = await messageResult;
                const { msg_search_result_total_count, msg_search_result_item_array } = msgResult;
                const formatedData = msg_search_result_total_count > 0 ? msg_search_result_item_array
                    .map(item => {
                        return {
                            conv_id: item.msg_search_result_item_conv_id,
                            conv_type: item.msg_search_result_item_conv_type,
                            messageArray: item.msg_search_result_item_message_array,
                            messageCount: item.msg_search_result_item_total_message_count
                        }
                    }) : [];

                const response = await addProfileForConversition(formatedData);
                return response;
            }

            const formatedContact = async ()=>{
                const contactRes = await searchContactResult
                const formatedData = contactRes.length > 0 ? contactRes.map(item => {
                    return {
                        conv_id: item.Uid,
                        conv_type: 1, // 默认都是c2c
                    }
                }) : []
                const response = await addProfileForConversition(formatedData);
                return response;
            }
            Promise.all([addProfileForMessageResult(), groupResult, friendsResult, formatedContact()]).then(searchResult => {
                const [messageResult, groupResult, friendsResult, contactResult] = searchResult;
                console.log(contactResult,9999)
                setSearchResult({
                    messageResult,
                    groupResult,
                    friendsResult,
                    contactResult: contactResult
                });
            });
        } else {
            setSearchResult({
                messageResult: [],
                groupResult: [],
                friendsResult: [],
                contactResult: []
            })
        }
    }, [inputValue]);

    const setValue = (value) => {
        setInputValue(value);
    }

    const handleInoputOnchange = debounce(setValue, 300);

    const handleModalClose = () => props.close();

    const generateTabList = () => {
        const { friendsResult, messageResult, groupResult, contactResult } = searchResult;
        const tabList = [{
            id: 'contacter',
            label: `联系人(${friendsResult.length})`
        }, {
            id: 'group',
            label: `群组(${groupResult.length})`
        }, {
            id: 'message',
            label: `消息(${messageResult.length})`
        },
        {
            id: 'contact',
            label: `通讯录(${contactResult.length})`
        }];

        return tabList;
    }

    return (
        <div className="search-message">
            <section className="search-message__input-area">
                <Icon className="search-message__input-area--icon" type="search" />
                <Input className="search-message__input-area--input" type="search" placeholder="查找消息等" onChange={handleInoputOnchange} />
                <Icon className="search-message__input-area--icon-close" type="close" onClick={handleModalClose} />
            </section>
            <section className="search-message__tab">
                <Tabs tabs={generateTabList()} >
                    <TabPanel id="contacter">
                        <ContacterResult result={searchResult.friendsResult} onClose={handleModalClose} />
                    </TabPanel>
                    <TabPanel id="group">
                        <GroupResult result={searchResult.groupResult} onClose={handleModalClose} />
                    </TabPanel>
                    <TabPanel id="message">
                        <MessageResult result={searchResult.messageResult} keyWords={inputValue} onClose={handleModalClose} />
                    </TabPanel>
                    <TabPanel id="contact">
                        <ContactResult result={searchResult.contactResult} onClose={handleModalClose} />
                    </TabPanel>
                </Tabs>
            </section>
        </div>
    )
}