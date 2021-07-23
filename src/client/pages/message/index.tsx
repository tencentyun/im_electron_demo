import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replaceConversaionList, updateCurrentSelectedConversation } from '../../store/actions/conversation';
import { getUserType } from '../../store/actions/userTypeList';
import { Avatar } from '../../components/avatar/avatar';

import { SearchBox } from '../../components/searchBox/SearchBox';
import { getConversionList, TIMConvDelete, TIMConvPinConversation, TIMMsgClearHistoryMessage, TIMMsgSetC2CReceiveMessageOpt, TIMMsgSetGroupReceiveMessageOpt } from './api';
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
import { EmptyResult } from './searchMessage/EmptyResult';
import { Myloader } from '../../components/skeleton';
import { replaceRouter } from '../../store/actions/ui';

export const Message = (): JSX.Element => {
    const [isLoading, setLoadingStatus ] = useState(false);
    const { conversationList, currentSelectedConversation } = useSelector((state: State.RootState) => state.conversation);
    const { replace_router } = useSelector((state:State.RootState)=>state.ui)
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
            id: "undisable",
            text: "移除消息免打扰"
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
        setLoadingStatus(false);
        dispatch(replaceConversaionList(response))
        if (response.length) {
            if (currentSelectedConversation === null) {
                dispatch(updateCurrentSelectedConversation(response[0]))
            }
        }else{
            dispatch(updateCurrentSelectedConversation(null))
        }
    }
    useEffect(() => {
        if(!replace_router){
            conversationList.length === 0 && setLoadingStatus(true);
            getData();
        }else{
            dispatch(replaceRouter(false))
        }
        
    }, []);
    
    useEffect(() => {
        getUsetStatus();
    }, [conversationList.length]);

    useEffect(() => {
        if (currentSelectedConversation?.conv_id) {
            const ref = getRef(currentSelectedConversation.conv_id);
            // @ts-ignore
            ref.current.scrollIntoViewIfNeeded();
        }
    }, [currentSelectedConversation]);

    useEffect(()=>{
        if(currentSelectedConversation===null && conversationList.length > 0){
            dispatch(updateCurrentSelectedConversation(conversationList[0]))
        }
    },[conversationList.length])

    useEffect(() => {
        if(currentSelectedConversation?.conv_id) {
            const ref = getRef(currentSelectedConversation.conv_id);
            // @ts-ignore
            ref?.current?.scrollIntoViewIfNeeded();
        }
    }, [currentSelectedConversation] );

    const handleConvListClick = convInfo => dispatch(updateCurrentSelectedConversation(convInfo));

    const handleSearchBoxClick = () => dialogRef.current.open();

    const getLastMsgInfo = (lastMsg:State.message,conv_type,conv_group_at_info_array) => {
        const { message_elem_array, message_status, message_is_from_self, message_sender_profile, message_is_peer_read,message_is_read } = lastMsg;
        const { user_profile_nick_name } = message_sender_profile;
        const revokedPerson = message_is_from_self ? '你' : user_profile_nick_name;
        const firstMsg = message_elem_array[0];
        const displayTextMsg = message_status === 6 ? `${revokedPerson} 撤回了一条消息` : firstMsg.text_elem_content;
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
        const isRead = message_is_from_self && message_is_peer_read || !message_is_from_self && message_is_read
        return <React.Fragment>
            
            {
               <span className={`icon ${isRead ? 'is-read' : ''}`} />
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


    const getUsetStatus = () => {
        if(conversationList.length <= 0){
            return
        }
        // 获取当前对话标列表好友状态
        // const sdkappid = "1400529075";
        const uid = "YANGGUANG37";
        const To_Account = ["denny1", "denny2"];
        conversationList.forEach((i) => {
            if (i.conv_type === 1) {
                To_Account.push(i.conv_id)
            }
        })
        // console.warn(conversationList, To_Account, '入参单个参数')
        getUserTypeQuery({ uid, To_Account }).then(data => {
            // console.warn(data, "获取联系人在线状态返回参数")
            if (data.ErrorCode === 0) {
                console.warn(1)
                dispatch(getUserType(data.queryResult))
            }
        }).catch(err => {
            console.warn('返回错误信息', err)
        })
    }
    
    const pingConv = (conv: State.conversationItem, isPinned: boolean) => {
        const { conv_id, conv_type, conv_is_pinned } = conv
        if (conv_is_pinned === isPinned) {
            if (isPinned) {
                console.log('会话已置顶')
                return;
            } else {
                console.log('会话未置顶')
                return
            }
        }
        TIMConvPinConversation(conv_id, conv_type, isPinned).then(data => {
            const { code } = data.data || {}
            if (code === 0) {
                console.log(!isPinned ? '取消置顶成功' : '置顶成功')
                getData()
            }
        }).catch(err => {

        })
    }

    const removeConv = (conv: State.conversationItem) => {
        const { conv_id, conv_type } = conv
        TIMConvDelete(conv_id, conv_type).then(data => {
            const { code } = data.data || {}
            if (code === 0) {
                // 删除会话后聊天框内容和qq一样转移成对话列表里的上一个或下一个人
                const index = conversationList.findIndex(i => i.conv_id === conv_id)
                if (conversationList.length > 1 && currentSelectedConversation.conv_id === conv_id) {
                    const fandIndex = index === conversationList.length - 1 ? index - 1 : index + 1
                    dispatch(updateCurrentSelectedConversation(conversationList[fandIndex]))
                }
                getData()
            }
        }).catch(err => {

        })
    }
    const cleanMessage = (conv: State.conversationItem) => {
        const { conv_id, conv_type } = conv
        TIMMsgClearHistoryMessage(conv_id, conv_type).then(data => {
            const { code } = data.data || {}
            if (code === 0) {
                console.log('删除消息成功')
                getData()
                // 清空消息
                dispatch(addMessage({
                    convId: conv_id,
                    messages: []
                }))
            }
        }).catch(err => {

        })
    }
    const disableRecMsg  = async (conv: State.conversationItem,isDisable:boolean) => {
        const { conv_type,conv_id } = conv;
        let data;
        if(conv_type === 1){
            data = await TIMMsgSetC2CReceiveMessageOpt(conv_id,isDisable?1:0)
        }
        if(conv_type === 2){
           data = await TIMMsgSetGroupReceiveMessageOpt(conv_id,isDisable?1:0)
        }
        console.log(data)
    }
    const handleClickMenuItem = (e,id) => {
        const { data }  = e.props;
        switch (id){
            case 'pinged':
                pingConv(data, true);
                break;
            case 'unpinged':
                pingConv(data, false);
                break;
            case 'remove':
                removeConv(data);
                break;
            case 'clean':
                cleanMessage(data);
                break;
            case 'disable':
                disableRecMsg(data,true);
                break;
            case 'undisable':
                disableRecMsg(data,false);
                break;

        }
    }

    if (isLoading) {
        return <Myloader />
    }

    if (currentSelectedConversation === null) {
        return <EmptyResult contentText="暂无会话" />
    }
    console.warn('当前对话列表所有人员信息', conversationList, currentSelectedConversation)
    return (
        <div className="message-content">
            <div className="message-list">
                <div className="search-wrap" onClick={handleSearchBoxClick}><SearchBox /></div>
                <div className="conversion-list">
                    {
                        currentSelectedConversation === null ? <EmptyResult contentText="暂无会话" /> :  conversationList.map((item) => {
                            const { conv_profile, conv_id, conv_last_msg, conv_unread_num,conv_type,conv_is_pinned, conv_group_at_info_array,conv_recv_opt } = item;
                            const faceUrl = conv_profile.user_profile_face_url ?? conv_profile.group_detial_info_face_url;
                            const nickName = conv_profile.user_profile_nick_name ?? conv_profile.group_detial_info_group_name;
                            return (
                                <div ref={setRef(conv_id)} className={`conversion-list__item ${conv_id === currentSelectedConversation.conv_id ? 'is-active' : ''} ${conv_is_pinned ? 'is-pinned' : ''}`} key={conv_id} onClick={() => handleConvListClick(item)} onContextMenu={(e) => { handleContextMenuEvent(e, item) }}>
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
                                    {
                                        conv_recv_opt===1 ? <span className="mute"></span>:null
                                    }
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
                                return <Item key={id} onClick={(e) => { handleClickMenuItem(e, id) }}>{text}</Item>
                            })
                        }

                    </Menu>
                </div>

            </div>
            <SearchMessageModal dialogRef={dialogRef} />
            {
                currentSelectedConversation && currentSelectedConversation.conv_id ? <MessageInfo {...currentSelectedConversation} /> : <div className="empty"><EmptyResult contentText="暂无历史消息" /></div>
            }
            {/* {
                currentSelectedConversation && currentSelectedConversation.conv_type === 2 ? <GroupToolBar conversationInfo={currentSelectedConversation} /> : <></>
            } */}
            {/* 音视频通话面板 */}
        </div>
    )
};