import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replaceConversaionList, updateCurrentSelectedConversation } from '../../store/actions/conversation';
import { Avatar } from '../../components/avatar/avatar';

import { SearchBox } from '../../components/searchBox/SearchBox';
import { getConversionList, TIMConvDelete, TIMConvPinConversation, TIMMsgClearHistoryMessage } from './api';
import './message.scss';
import { MessageInfo } from './MessageInfo';
import { GroupToolBar } from './GroupToolBar';
import {
    Menu,
    Item,
    contextMenu,
    theme,
    animation
} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import { SearchMessageModal } from './searchMessage';
import { useDialogRef } from "../../utils/react-use/useDialog";
import useDynamicRef from "../../utils/react-use/useDynamicRef";
import { addMessage } from '../../store/actions/message';
import timeFormat from '../../utils/timeFormat';

export const Message = (): JSX.Element => {
    const { conversationList, currentSelectedConversation } = useSelector((state: State.RootState) => state.conversation);
    const dialogRef = useDialogRef();
    const [setRef, getRef] = useDynamicRef<HTMLDivElement>();

    const convMenuID = "CONV_HANDLE"

    const convMenuItem = [
        {
            id: "pinged",
            text: "会话置顶"
        },
        {
            id: "unpinged",
            text: "取消置顶"
        },
        {
            id: "disable",
            text: "消息免打扰"
        },
        {
            id: "remove",
            text: "移除会话"
        },
        {
            id: "clean",
            text: "清除消息"
        }
    ]
    const dispatch = useDispatch();
    const getData = async () => {
        const response = await getConversionList();
        dispatch(replaceConversaionList(response))
        if (response.length) {
            if (currentSelectedConversation === null) {
                dispatch(updateCurrentSelectedConversation(response[0]))
            }
        }
    }
    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        if(currentSelectedConversation?.conv_id) {
            const ref = getRef(currentSelectedConversation.conv_id);
            // @ts-ignore
            ref.current.scrollIntoViewIfNeeded();
        }
    }, [currentSelectedConversation] );

    const handleConvListClick = convInfo => dispatch(updateCurrentSelectedConversation(convInfo));

    const handleSearchBoxClick = () => dialogRef.current.open();

    const getLastMsgInfo = (lastMsg,conv_type,conv_group_at_info_array) => {
        const { message_elem_array, message_status, message_is_from_self, message_sender_profile, message_is_peer_read } = lastMsg;
        const { user_profile_nick_name } = message_sender_profile;
        const revokedPerson = message_is_from_self ? '你' : user_profile_nick_name;
        const firstMsg = message_elem_array[0];
        const displayTextMsg  = message_status === 6 ? `${revokedPerson} 撤回了一条消息` : firstMsg.text_elem_content;
        const displayLastMsg = {
            '0': displayTextMsg,
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
        const hasAtMessage = conv_group_at_info_array && conv_group_at_info_array.length;
        const atDisPlayMessage = hasAtMessage && conv_group_at_info_array.pop().conv_group_at_info_at_type === 1 ? "@我" : "@所有人"
        return <React.Fragment>
            {
               conv_type === 1 ? <span className={`icon ${message_is_peer_read ? 'is-read' : ''}`} /> : null
            }
            {
                conv_type && hasAtMessage ? <span className="at-msg">{atDisPlayMessage}</span> : null
            }
            <span className="text">{displayLastMsg}</span>
        </React.Fragment>;
    }

    const getDisplayUnread = (count) => {
        return count > 9 ? '···' : count
    }

    const handleContextMenuEvent = (e, conv: State.conversationItem) => {
        e.preventDefault()
        contextMenu.show({
            id: convMenuID,
            event: e,
            props: {
                data: conv
            }
        })
    }

    const pingConv = (conv: State.conversationItem,isPinned:boolean)=>{
        const { conv_id,conv_type,conv_is_pinned } = conv
        if(conv_is_pinned === isPinned){
            if(isPinned){
                console.log('会话已置顶')
                return;
            }else {
                console.log('会话未置顶')
                return
            }
        }
        TIMConvPinConversation(conv_id,conv_type,isPinned).then(data=>{
            const { code } = data.data||{}
            if(code === 0){
                console.log(!isPinned ? '取消置顶成功':'置顶成功')
                getData()
            }
        }).catch(err=>{

        })
    }
    
    const removeConv = (conv: State.conversationItem)=>{
        const { conv_id,conv_type } = conv
        TIMConvDelete(conv_id,conv_type).then(data=>{
            const { code } = data.data||{}
            if(code === 0){
                console.log('删除会话成功')
                getData()
            }
        }).catch(err=>{

        })
    }
    const cleanMessage = (conv: State.conversationItem)=>{
        const { conv_id,conv_type } = conv
        TIMMsgClearHistoryMessage(conv_id,conv_type).then(data=>{
            const { code } = data.data||{}
            if(code === 0){
                console.log('删除消息成功')
                getData()
                // 清空消息
                dispatch(addMessage({
                    convId: conv_id,
                    messages: []
                }))
            }
        }).catch(err=>{

        })
    }
    const handleClickMenuItem = (e,id) => {
        const { data }  = e.props;
        switch (id){
            case 'pinged':
                pingConv(data,true);
                break;
            case 'unpinged':
                pingConv(data,false);
                break;
            case 'remove':
                removeConv(data);
                break;
            case 'clean':
                cleanMessage(data);
                break

        }
    }

    if (currentSelectedConversation === null) {
        return null
    }

    return (
        <div className="message-content">
            <div className="message-list">
                <div className="search-wrap" onClick={handleSearchBoxClick}><SearchBox /></div>
                <div className="conversion-list">
                    {
                        conversationList.map((item) => {
                            const { conv_profile, conv_id, conv_last_msg, conv_unread_num,conv_type,conv_is_pinned, conv_group_at_info_array } = item;
                            const faceUrl = conv_profile.user_profile_face_url ?? conv_profile.group_detial_info_face_url;
                            const nickName = conv_profile.user_profile_nick_name ?? conv_profile.group_detial_info_group_name;
                            return (
                                <div ref={setRef(conv_id)} className={`conversion-list__item ${conv_id === currentSelectedConversation.conv_id ? 'is-active' : ''} ${conv_is_pinned ? 'is-pinned':''}`} key={conv_id} onClick={() => handleConvListClick(item)} onContextMenu={(e) => { handleContextMenuEvent(e, item) }}>
                                    <div className="conversion-list__item--profile">
                                        {
                                            conv_unread_num > 0 ? <div className="conversion-list__item--profile___unread">{getDisplayUnread(conv_unread_num)}</div> : null
                                        }
                                        <Avatar url={faceUrl} nickName={nickName} userID={conv_id} groupID={conv_id} size='small' />
                                    </div>
                                    <div className="conversion-list__item--info">
                                        <div className="conversion-list__item--time-wrapper">
                                            <span className="conversion-list__item--nick-name">{nickName || conv_id}</span>
                                            {
                                                conv_last_msg && <span className="conversion-list__item--format-time">{timeFormat(conv_last_msg.message_client_time * 1000, false)}</span>
                                            }
                                        </div>
                                        {
                                            conv_last_msg ? <div className="conversion-list__item--last-message">{getLastMsgInfo(conv_last_msg,conv_type,conv_group_at_info_array)}</div> : null
                                        }
                                    </div>
                                    <span className="pinned-tag"></span>
                                </div>
                            )
                        })
                    }
                    <Menu
                        id={convMenuID}
                        theme={theme.light}
                        animation={animation.fade}
                        onShown={() => console.log('SHOWN')}
                        onHidden={() => console.log('HIDDEN')}
                    >
                        {
                            convMenuItem.map(({ text, id }) => {
                                return <Item key={id} onClick={(e)=>{handleClickMenuItem(e,id)}}>{text}</Item>
                            })
                        }

                    </Menu>
                </div>

            </div>
            <SearchMessageModal dialogRef={dialogRef} />
            {
                currentSelectedConversation && currentSelectedConversation.conv_id ? <MessageInfo {...currentSelectedConversation} /> : null
            }
            {
                currentSelectedConversation && currentSelectedConversation.conv_type === 2 ? <GroupToolBar conversationInfo={currentSelectedConversation} /> : <></>
            }
            {/* 音视频通话面板 */}
        </div>
    )
};