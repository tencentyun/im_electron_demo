import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    Menu,
    Item,
    contextMenu,
    theme,
    animation
} from 'react-contexify';
import './message-view.scss';
import { revokeMsg, deleteMsg, sendMsg, getLoginUserID, sendMergeMsg, TextMsg, getMsgList } from './api';
import { markeMessageAsRevoke, deleteMessage, reciMessage,  addMoreMessage } from '../../store/actions/message';
import { ConvItem, ForwardType } from './type'
import { 
    getMessageId,
    getConvId,
    getConvType,
    getMergeMessageTitle,
    getMergeMessageAbstactArray
} from '../../utils/messageUtils'
import { Avatar } from '../../components/avatar/avatar';
import { TextElemItem } from './messageElemTyps/textElemItem';
import { PicElemItem } from './messageElemTyps/picElemItem';
import { CustomElem } from './messageElemTyps/customElem';
import { VoiceElem } from './messageElemTyps/voiceElem';
import { FileElem } from './messageElemTyps/fileElem';
import { GroupTipsElemItem } from './messageElemTyps/grouptipsElem';
import { VideoElem } from './messageElemTyps/videoElem';
import { MergeElem } from './messageElemTyps/mergeElem';
import { ForwardPopup } from './components/forwardPopup';
import { Icon, message } from 'tea-component';
import formateTime from '../../utils/timeFormat';
import { addTimeDivider } from '../../utils/addTimeDivider';
import { HISTORY_MESSAGE_COUNT } from '../../constants';
import { GroupSysElm } from './messageElemTyps/groupSystemElem';
import { setCurrentReplyUser } from '../../store/actions/message'

const MESSAGE_MENU_ID = 'MESSAGE_MENU_ID';

type Props = {
    messageList: Array<State.message>
    groupType: number;
}

const RIGHT_CLICK_MENU_LIST = [{
    id: 'revoke',
    text: '撤回'
},
{
    id: 'delete',
    text: '删除'
},
{
    id: 'transimit',
    text: '转发'
},
{
    id: 'reply',
    text: '回复'
},
{
    id: 'multiSelect',
    text: '多选'
}];

export const displayDiffMessage = (message, element, index) => {
    const { elem_type, ...res } = element;
    let resp
    switch (elem_type) {
        case 0:
            resp = <TextElemItem {...res} />
            break;
        case 1:
            resp = <PicElemItem { ...res }/>
            break;
        case 2:
            resp = <VoiceElem { ...res }/>
            break;
        case 3:
            resp = <CustomElem { ...res }/>
            break;
        case 4:
            resp = <FileElem message={message} element={element} index={index}/>
            break;
        case 5:
            resp = <GroupTipsElemItem { ...res }/> 
            break;
        case 6:
            resp = <div>表情消息</div>
            break;
        case 7:
            resp = <div>位置消息</div>
            break;
        case 8:
            resp = <GroupSysElm { ...res }/>  
            break;
        case 9:
            resp =  <VideoElem { ...res }/>
            break;
        case 10:
            resp = <div>关系消息</div>
            break;
        case 11:
            resp = <div>资料消息</div>
            break;
        case 12:
            resp = <MergeElem { ...res } message={message}/>
            break;
        default:
            resp = null;
            break;
    }
    return resp;
}


export const MessageView = (props: Props): JSX.Element => {
    const { messageList, groupType } = props;
    const messageViewRef = useRef(null);
    const [isTransimitPopup, setTransimitPopup] = useState(false);
    const [isMultiSelect, setMultiSelect] = useState(false);
    const [forwardType, setForwardType] = useState<ForwardType>(ForwardType.divide);
    const [seletedMessage, setSeletedMessage] = useState<State.message[]>([]);
    const [noMore,setNoMore] = useState(messageList.length < HISTORY_MESSAGE_COUNT ? true : false)
    const dispatch = useDispatch();
    const [anchor , setAnchor] = useState('')

    const [rightClickMenuList, setRightClickMenuList] = useState(RIGHT_CLICK_MENU_LIST);
    
    useEffect(() => {
        if(!anchor){
            messageViewRef?.current?.firstChild?.scrollIntoViewIfNeeded();
        }
        setAnchor('')
        setNoMore(messageList.length < HISTORY_MESSAGE_COUNT ? true : false)
    }, [messageList.length])
    const handleRevokeMsg = async (params) => {
        const { convId, msgId, convType } = params;
        const code = await revokeMsg({
            convId,
            convType,
            msgId
        });
        if(code === 20016) {
            message.error({content: '消息超出可撤回时间'})
        }
        code === 0 && dispatch(markeMessageAsRevoke({
            convId,
            messageId: msgId
        }));

    };

    const handleDeleteMsg = async (params) => {
        const { convId, msgId, convType } = params;
        const code = await deleteMsg({
            convId,
            convType,
            msgId
        });
        code === 0 && dispatch(deleteMessage({
            convId,
            messageId: msgId
        }));
    };

    const handleTransimitMsg = (params) => {
        const { message } = params;
        setTransimitPopup(true)
        setSeletedMessage([message])
    }

    const handleReplyMsg = (params) => {
        const { message } = params;
        const { message_sender, message_sender_profile } = message
        dispatch(setCurrentReplyUser({
            profile: message_sender_profile
        }))
    }

    const handleForwardPopupSuccess = async (convItemGroup: ConvItem[]) => {
        const userId = await getLoginUserID()
        const isDivideSending = forwardType === ForwardType.divide
        const isCombineSending = !isDivideSending
        convItemGroup.forEach(async (convItem, k) => {
            if(isDivideSending) {
                seletedMessage.forEach(async message => {
                    const { data: { code, json_params } } = await sendMsg({
                        convId: getConvId(convItem),
                        convType: getConvType(convItem),
                        messageElementArray: message.message_elem_array as [TextMsg],
                        userId
                    });
                    if(code === 0) {
                        dispatch(reciMessage({
                            convId: getConvId(convItem),
                            messages: [JSON.parse(json_params)]
                        }))
                    }
                })
            }
            else if(isCombineSending) {
                const { data: { code, json_params } } = await sendMergeMsg({
                    convId: getConvId(convItem),
                    convType: getConvType(convItem),
                    messageElementArray: [{
                        elem_type: 12,
                        merge_elem_title: getMergeMessageTitle(seletedMessage[0]),
                        merge_elem_abstract_array: getMergeMessageAbstactArray(seletedMessage),
                        merge_elem_compatible_text: "你的版本不支持此消息",
                        merge_elem_message_array: seletedMessage
                    }],
                    userId
                });
                if(code === 0) {
                    dispatch(reciMessage({
                        convId: getConvId(convItem),
                        messages: [JSON.parse(json_params)]
                    }))
                }
            }
        })
        setTransimitPopup(false)
        setSeletedMessage([])
        setMultiSelect(false)
    }
    const handleForwardTypePopup = (type: ForwardType) => {
        if(!seletedMessage.length) return false;
        setTransimitPopup(true)
        setForwardType(type)
    }
    const handleMultiSelectMsg = (params) => {
        setMultiSelect(true)
    }
    const handleSelectMessage = (message: State.message): void => {
        const isMessageSelected = seletedMessage.findIndex(v => getMessageId(v) === getMessageId(message)) > -1 
        if(isMessageSelected) {
            const list = seletedMessage.filter(v => getMessageId(v) !== getMessageId(message))
            setSeletedMessage(list)
        } else {
            seletedMessage.push(message)
            setSeletedMessage(Array.from(seletedMessage))
        }
    }
    const handlRightClick = (e, id) => {
        const { data } = e.props;
        switch (id) {
            case 'revoke':
                handleRevokeMsg(data);
                break;
            case 'delete':
                handleDeleteMsg(data);
                break;
            case 'transimit':
                handleTransimitMsg(data);
                break;
            case 'reply':
                handleReplyMsg(data);
                break;
            case 'multiSelect':
                handleMultiSelectMsg(data);
                break;
        }
    }

    const cacluateRightMenuList = (message: State.message, element) => {
        const { elem_type } = element;
        const { message_is_from_self } = message;
        const isTips = [5,8].includes(elem_type);
        const isAvaChatRoom = groupType === 4;
        let formatedList = RIGHT_CLICK_MENU_LIST;

        if(!message_is_from_self) {
            formatedList = formatedList.filter(item => item.id !== 'revoke');
        }

        if(isTips) {
            formatedList = formatedList.filter(item => item.id !== 'transimite' && item.id !== 'multiSelect'); //群系统消息 和 tips消息 不可转发
        } else if(isAvaChatRoom) {
            formatedList = formatedList.filter(item => item.id  !== 'multiSelect'); // 互动直播群不进行多选
        }

        return formatedList;

    };

    const handleContextMenuEvent = (e, message: State.message, element) => {
        e.preventDefault();
        const rightMenuList = cacluateRightMenuList(message, element);

        setRightClickMenuList(rightMenuList);

        contextMenu.show({
            id: MESSAGE_MENU_ID,
            event: e,
            props: {
                data: {
                    convId: message.message_conv_id,
                    msgId: message.message_msg_id,
                    convType: message.message_conv_type,
                    message: message
                }
            }
        })
    }

    const handleMessageReSend = (item) => {
        console.log(item);
    }

    
    const validatelastMessage = (messageList:State.message[])=>{
        let msg:State.message;
        for(let i = messageList.length-1;i>-1;i--){
            if(messageList[i].message_msg_id){
                msg = messageList[i];
                break;
            }
        }
        return msg;
    }
    const getMoreMsg = async () => {
        if(!noMore){
            
            const msg:State.message = validatelastMessage(messageList)
            if(!msg){
                return
            }
            const { message_conv_id,message_conv_type,message_msg_id  } = msg;
            const messageResponse = await getMsgList(message_conv_id, message_conv_type,message_msg_id);
            if(messageResponse.length>0){
                setAnchor(message_msg_id) 
            }else{
                setNoMore(true)
            }
            const addTimeDividerResponse = addTimeDivider(messageResponse.reverse());
            const payload = {
                convId: message_conv_id,
                messages: addTimeDividerResponse.reverse(),
            };
            dispatch(addMoreMessage(payload));
        }
    }
    return (
        <div className="message-view" ref={messageViewRef}>
            {
               messageList && messageList.length > 0 &&
                messageList.map((item, index) => {
                    if(!item){
                        return null
                    }
                    if (item.isTimeDivider) {
                        return (
                            <div key={item.time} className="message-view__item--time-divider">{formateTime(item.time * 1000, true)}</div>
                        )
                    }
                    const { message_elem_array, message_sender_profile, message_is_from_self ,message_status, message_is_peer_read, message_conv_type } = item;
                    console.log('item', item);
                    const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = message_sender_profile;
                    const revokedPerson = message_is_from_self ? '你' : user_profile_nick_name;
                    const isMessageSendFailed = message_status === 3 && message_is_from_self;
                    const shouldShowPerReadIcon = message_conv_type === 1 && message_is_from_self && !isMessageSendFailed;
                    const seleted = seletedMessage.findIndex(i => getMessageId(i) === getMessageId(item)) > -1
                    const elemType = message_elem_array?.[0]?.elem_type; // 取message array的第一个判断消息类型
                    const isNotGroupSysAndGroupTipsMessage =  ![5,8].includes(elemType); // 5,8作为群系统消息 不需要多选转发
                                        
                    return (
                        <React.Fragment key={index}>
                            {
                                message_status === 6 ? (
                                    <div className="message-view__item is-revoked" >
                                        { `${revokedPerson} 撤回了一条消息` }
                                    </div>
                                ) :
                                <>
                                   {
                                        message_elem_array && message_elem_array.length && message_elem_array.map((elment, index) => {
                                            return (
                                                <div onClick={() => handleSelectMessage(item)} className={`message-view__item ${message_is_from_self ? 'is-self' : ''}`} >
                                                    { isMultiSelect && isNotGroupSysAndGroupTipsMessage && (seleted ? 
                                                        <Icon className="message-view__item--icon" type="success" /> : 
                                                        <i className="message-view__item--icon-normal" ></i>)
                                                    }
                                                    <div className="message-view__item--avatar face-url">
                                                        <Avatar url={user_profile_face_url} size="small" nickName={user_profile_nick_name} userID={user_profile_identifier} />
                                                    </div>
                                                    {
                                                        // message_elem_array && message_elem_array.length && message_elem_array.map((elment, index) => {
                                                        //     return (
                                                                <div className="message-view__item--element" key={index} onContextMenu={(e) => { handleContextMenuEvent(e, item, elment) }}>

                                                                    {
                                                                        displayDiffMessage(item, elment, index)
                                                                    }
                                                                </div>
                                                        //     )
                                                        // })
                                                    }
                                                    {
                                                        shouldShowPerReadIcon ? <span className={`message-view__item--element-icon ${message_is_peer_read ? 'is-read' : ''}`}></span> :
                                                        isMessageSendFailed &&  <Icon className="message-view__item--element-icon-error" type="error" onClick={() => handleMessageReSend(item)} />
                                                    }
                                                </div>
                                            )
                                        })
                                   }
                                </>
                            }
                            <div className="message-view__item--blank"></div>
                        </React.Fragment>
                    )
                })
            }
            <Menu
                id={MESSAGE_MENU_ID}
                theme={theme.light}
                animation={animation.fade}
            >
                {
                    rightClickMenuList.map(({ id, text }) => {
                        return (
                            <Item  key={id} onClick={(e) => handlRightClick(e, id)}>
                                {text}
                            </Item>
                        )
                    })
                }
            </Menu>
            {
                isTransimitPopup && <ForwardPopup onSuccess={handleForwardPopupSuccess} onClose={() => {setTransimitPopup(false)}}/>
            }
            {
                isMultiSelect && 
                <div className="forward-type-popup">
                    <Icon type="close" className="forward-type-popup__close" onClick={() => setMultiSelect(false)} />
                    <div className="forward-type-popup__combine" onClick={() => handleForwardTypePopup(ForwardType.combine)}>
                        <p>合并转发</p>
                    </div>
                    <div className="forward-type-popup__divide" onClick={() => handleForwardTypePopup(ForwardType.divide)}>
                        <p>逐条转发</p>
                    </div>
                </div>   
            }
            <div className={`showMore ${noMore ? 'no-more': ''}`} onClick={getMoreMsg}>{noMore ? '没有更多了': '查看更多'}</div>
        </div>
    )
};