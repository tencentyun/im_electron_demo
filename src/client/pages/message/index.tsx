import React, { useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateConversationList, updateCurrentSelectedConversation } from '../../store/actions/conversation';
import { Avatar } from '../../components/avatar/avatar';

import { SearchBox } from '../../components/searchBox/SearchBox';
import { getConversionList } from './api';
import './message.scss';
import { MessageInfo } from './MessageInfo';


export const Message = (): JSX.Element => {
    
    
    const { conversationList,currentSelectedConversation  } = useSelector((state: State.RootState) => state.conversation);

    const dispatch = useDispatch();

    useEffect(() => {
        const getData = async () => {
            const response = await getConversionList();
            dispatch(updateConversationList(response))
            console.log(response,'response')
            if(response.length){
                dispatch(updateCurrentSelectedConversation(response[0]))
            }
        }
        getData();
    }, []);

    const handleConvListClick = convInfo => dispatch(updateCurrentSelectedConversation(convInfo));

    const getLastMsgInfo = lastMsg => {
        const {message_elem_array,  message_is_peer_read} = lastMsg;
        const firstMsg = message_elem_array[0];
        const displayLastMsg = {
            '0': firstMsg.text_elem_content,
            '1': '[图片]',
            '2': '[声音]',
            '3': '[自定义消息]',
            '4': '[文件消息]',
            '5': '[群组系统消息]',
            '6': '[表情消息]',
            '7': '[位置消息]',
            '8': '[群组系统通知]',
            '9': '[视频消息]',
            '10': '[关系]',
            '11': '[资料]',
            '12': '[合并消息]',
        }[firstMsg.elem_type];

        return <React.Fragment>
            <span className={`icon ${message_is_peer_read ? 'is-read' : ''}` } />
            <span className="text">{displayLastMsg}</span>
        </React.Fragment>;
    }
    const getDisplayUnread = (count) => {
        return count > 9 ? '···' : count
    }
    if(currentSelectedConversation === null){
        return null
    }
    return (
        <div className="message-content">
            <div className="message-list">
                <div className="search-wrap"><SearchBox/></div>
                <div className="conversion-list">
                    {
                        conversationList.map((item) => {

                            const {conv_profile, conv_id, conv_last_msg, conv_unread_num } = item;
                            const faceUrl = conv_profile.user_profile_face_url ?? conv_profile.group_detial_info_face_url;
                            const nickName = conv_profile.user_profile_nick_name ?? conv_profile.group_detial_info_group_name;
                            return (
                                <div className={`conversion-list__item ${conv_id === currentSelectedConversation.conv_id ? 'is-active' : ''}`} key={conv_id} onClick={() => handleConvListClick(item)}>
                                    <div className="conversion-list__item--profile">
                                        {
                                            conv_unread_num > 0 ? <div className="conversion-list__item--profile___unread">{ getDisplayUnread(conv_unread_num) }</div> : null
                                        }
                                        <Avatar url={faceUrl} nickName={nickName} userID={conv_id} groupID={conv_id} size='small'/>
                                    </div>
                                    <div className="conversion-list__item--info">
                                        <div className="conversion-list__item--nick-name">{nickName || conv_id }</div>
                                        <div className="conversion-list__item--last-message">{getLastMsgInfo(conv_last_msg)}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

            </div>
            {
                currentSelectedConversation && currentSelectedConversation.conv_id ? <MessageInfo {...currentSelectedConversation} /> : null
            }
        </div>
    )
};