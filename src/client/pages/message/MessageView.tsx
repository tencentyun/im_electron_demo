import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Menu,
    Item,
    contextMenu,
    theme,
    animation
} from 'react-contexify';
import './message-view.scss';
import { revokeMsg, deleteMsg, sendMsg, getLoginUserID, sendMergeMsg, TextMsg } from './api';
import { markeMessageAsRevoke, deleteMessage, reciMessage } from '../../store/actions/message';
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
import { Icon } from 'tea-component';
import formateTime from '../../utils/timeFormat';

const MESSAGE_MENU_ID = 'MESSAGE_MENU_ID';

type Props = {
    messageList: Array<State.message>
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



export const MessageView = (props: Props): JSX.Element => {
    const { messageList } = props;
    const [isTransimitPopup, setTransimitPopup] = useState(false);
    const [isMultiSelect, setMultiSelect] = useState(false);
    const [forwardType, setForwardType] = useState<ForwardType>(ForwardType.divide);
    const [seletedMessage, setSeletedMessage] = useState<State.message[]>([]);
    const dispatch = useDispatch();

    const handleRevokeMsg = async (params) => {
        const { convId, msgId, convType } = params;
        const code = await revokeMsg({
            convId,
            convType,
            msgId
        });
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

    const handleForwardPopupSuccess = async (convItemGroup: ConvItem[]) => {
        const userId = await getLoginUserID()
        const isDivideSending = forwardType === ForwardType.divide
        const isCombineSending = isDivideSending
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
                handleDeleteMsg(data);
                break;
            case 'multiSelect':
                handleMultiSelectMsg(data);
                break;
        }
    }

    const handleContextMenuEvent = (e, message: State.message) => {
        e.preventDefault();
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

    const displayDiffMessage = (element) => {
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
                resp = <FileElem { ...res }/>
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
                resp = <div>群组系统通知</div>
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
                resp = <MergeElem { ...res }/>
                break;
            default:
                resp = null;
                break;
        }
        return resp;
    }
    return (
        <div className="message-view">
            {
               messageList && messageList.length > 0 &&
                messageList.map(item => {
                    if(!item){
                        return null
                    }
                    if (item.isTimeDivider) {
                        return (
                            <div key={item.time} className="message-view__item--time-divider">{formateTime(item.time * 1000, true)}</div>
                        )
                    }
                    const { message_elem_array, message_sender_profile, message_is_from_self, message_msg_id, message_status, message_is_peer_read, message_conv_type } = item;
                    const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = message_sender_profile;
                    const revokedPerson = message_is_from_self ? '你' : user_profile_nick_name;
                    const shouldShowPerReadIcon = message_conv_type === 1 && message_is_from_self;
                    const seleted = seletedMessage.findIndex(i => getMessageId(i) === getMessageId(item)) > -1
                    return (
                        <React.Fragment key={message_msg_id}>
                            {
                                message_status === 6 ? (
                                    <div className="message-view__item is-revoked" >
                                        { `${revokedPerson} 撤回了一条消息` }
                                    </div>
                                ) :
                                <div onClick={() => handleSelectMessage(item)} className={`message-view__item ${message_is_from_self ? 'is-self' : ''}`} key={message_msg_id}>
                                    { isMultiSelect && (seleted ? 
                                        <Icon className="message-view__item--icon" type="success" /> : 
                                        <i className="message-view__item--icon-normal" ></i>)
                                    }
                                    <div className="message-view__item--avatar face-url">
                                        <Avatar url={user_profile_face_url} size="small" nickName={user_profile_nick_name} userID={user_profile_identifier} />
                                    </div>
                                    {
                                        message_elem_array && message_elem_array.length && message_elem_array.map((elment, index) => {
                                            return (
                                                <div className="message-view__item--element" key={index} onContextMenu={(e) => { handleContextMenuEvent(e, item) }}>
                                                    
                                                    {
                                                        displayDiffMessage(elment)
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                    {
                                        shouldShowPerReadIcon && <span className={`message-view__item--element-icon ${message_is_peer_read ? 'is-read' : ''}`}></span>
                                    }
                                </div>
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
                    RIGHT_CLICK_MENU_LIST.map(({ id, text }) => {
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
        </div>
    )
};