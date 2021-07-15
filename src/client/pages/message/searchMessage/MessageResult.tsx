import React, { useState } from 'react';
import { Button } from '@tencent/tea-component';
import { Avatar } from '../../../components/avatar/avatar';
import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';

import './message-result.scss';

export const MessageResult = (props) => {
    const { result, keyWords, onClose } = props;
    const directToConv = useMessageDirect();
    const [activedItem, setActivedItem] = useState(result[0]);
    const regex = new RegExp(keyWords, "g");

    const hilightKeyWords = messageText => messageText.replace(regex, `<span className="highlight">${keyWords}</span>`);

    const handleItemClick = (item) => setActivedItem(item);

    const handleOpenConv = () => {
        directToConv({
            convType: activedItem.conv_type,
            profile: activedItem.conv_profile,
            beforeDirect: onClose
        })
    } 

    return (
        <div className="message-result ">
            {
                result.length > 0 ? 
                <div className="message-result__content">
                    <div className="message-result__content--item-content customize-scroll-style">
                        {
                            result.map(item => {
                                const { messageArray, conv_profile, conv_id } = item;
                                const faceUrl = conv_profile.user_profile_face_url ?? conv_profile.group_detial_info_face_url;
                                const nickName = conv_profile.user_profile_nick_name ?? conv_profile.group_detial_info_group_name;
                                const { message_elem_array } = messageArray[0];
        
                                return (
                                    <div className={`message-result__content-item ${activedItem.conv_id === conv_id ? 'is-active' : ''}`} onClick={() => handleItemClick(item)}>
                                        <Avatar url={faceUrl}></Avatar>
                                        <div className="message-result__content-item--text">
                                            <span className="message-result__content-item--nick-name">{nickName}</span>
                                            <span className="message-result__content-item--msg-text" dangerouslySetInnerHTML={{__html: hilightKeyWords( message_elem_array[0].text_elem_content)}} ></span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="message-result__content--message-list ">
                        <div className="message-result__content--message-list-content customize-scroll-style">
                            {
                            activedItem.messageArray.map(item => {
                                const { message_elem_array, message_sender_profile: { user_profile_face_url, user_profile_nick_name} } = item as State.message;
                                return (
                                    <div className="message-result__content-item" >
                                            <Avatar url={user_profile_face_url}></Avatar>
                                            <div className="message-result__content-item--text">
                                                <span className="message-result__content-item--nick-name">{user_profile_nick_name}</span>
                                                <span className="message-result__content-item--msg-text" dangerouslySetInnerHTML={{__html: hilightKeyWords( message_elem_array[0].text_elem_content)}} ></span>
                                            </div>
                                        </div>
                                )
                                
                                })
                            }
                        </div>
                        <Button className="message-result__content--button" type="primary" onClick={handleOpenConv}>打开会话</Button>
                    </div>
                </div> :
                <EmptyResult />
            }
        </div>
    )
}