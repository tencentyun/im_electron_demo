import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateConversationList, updateCurrentSelectedConversation } from '../../store/actions/conversation';
import { Avatar } from '../../components/avatar/avatar';

import { SearchBox } from '../../components/searchBox/SearchBox';
import { getConversionList, TIMConvDelete, TIMConvPinConversation } from './api';
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
import { SearchMessageModal } from './SearchMesssageModal';
import { useDialogRef } from "../../utils/react-use/useDialog";

export const Message = (): JSX.Element => {
    const { conversationList, currentSelectedConversation } = useSelector((state: State.RootState) => state.conversation);
    const dialogRef = useDialogRef();

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
        }
    ]
    const dispatch = useDispatch();
    const getData = async () => {
        const response = await getConversionList();
        console.log(response,'asd')
        dispatch(updateConversationList(response))
        if (response.length) {
            if (currentSelectedConversation === null) {
                dispatch(updateCurrentSelectedConversation(response[0]))
            }
        }
    }
    useEffect(() => {
        
        getData();
    }, []);

    const handleConvListClick = convInfo => dispatch(updateCurrentSelectedConversation(convInfo));

    const handleSearchBoxClick = () => dialogRef.current.open();

    const getLastMsgInfo = lastMsg => {
        const { message_elem_array, message_is_peer_read } = lastMsg;
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
            <span className={`icon ${message_is_peer_read ? 'is-read' : ''}`} />
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

                            const { conv_profile, conv_id, conv_last_msg, conv_unread_num } = item;
                            const faceUrl = conv_profile.user_profile_face_url ?? conv_profile.group_detial_info_face_url;
                            const nickName = conv_profile.user_profile_nick_name ?? conv_profile.group_detial_info_group_name;
                            return (
                                <div className={`conversion-list__item ${conv_id === currentSelectedConversation.conv_id ? 'is-active' : ''}`} key={conv_id} onClick={() => handleConvListClick(item)} onContextMenu={(e) => { handleContextMenuEvent(e, item) }}>
                                    <div className="conversion-list__item--profile">
                                        {
                                            conv_unread_num > 0 ? <div className="conversion-list__item--profile___unread">{getDisplayUnread(conv_unread_num)}</div> : null
                                        }
                                        <Avatar url={faceUrl} nickName={nickName} userID={conv_id} groupID={conv_id} size='small' />
                                    </div>
                                    <div className="conversion-list__item--info">
                                        <div className="conversion-list__item--nick-name">{nickName || conv_id}</div>
                                        <div className="conversion-list__item--last-message">{getLastMsgInfo(conv_last_msg)}</div>
                                    </div>
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
        </div>
    )
};