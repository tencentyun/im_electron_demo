import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Avatar } from '../../components/avatar/avatar';
import { revokeMsg, deleteMsg, sendMsg } from './api';
import {
    Menu,
    Item,
    contextMenu,
    theme,
    animation
} from 'react-contexify';

import './message-view.scss';
import { TextElemItem } from './messageElemTyps/textElemItem';
import { PicElemItem } from './messageElemTyps/picElemItem';
import { markeMessageAsRevoke, deleteMessage, reciMessage } from '../../store/actions/message';
import { CustomElem } from './messageElemTyps/customElem';
import { VoiceElem } from './messageElemTyps/voiceElem';
import { FileElem } from './messageElemTyps/fileElem';
import { GroupTipsElemItem } from './messageElemTyps/grouptipsElem';
import { VideoElem } from './messageElemTyps/videoElem';
import { MergeElem } from './messageElemTyps/mergeElem';
import { ForwardPopup } from './components/forwardPopup';
import formateTime from '../../utils/timeFormat';
import { Icon } from '@tencent/tea-component';

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

const getId = (item) => {
    if(!item) return false
    return item.message_msg_id
}


export const MessageView = (props: Props): JSX.Element => {
    const { messageList } = props;
    const [ isTransimitPopup, setTransimitPopup ] = useState(false);
    const [ isForwardTypePopup, setForwardTypePopup ] = useState(true);
    const [ isMultiSelect, setMultiSelect ] = useState(false);
    const [ seletedMessage, setSeletedMessage ] = useState([]);
    const dispatch = useDispatch();
    let forwardType: string;

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
        const { convId, msgId, convType, message } = params;
        setTransimitPopup(true)
        setSeletedMessage([message])
    }

    const handleForwardPopupSuccess = (userList) => {
        setTransimitPopup(false)
        userList.forEach(async (user, k) => {
            const userId = "lexuslin";
            const { data: { code, json_params } } = await sendMsg({
                convId: "lexuslin3",
                convType: 1,
                messageElementArray: seletedMessage[0].message_elem_array,
                userId,
                messageAtArray: []
            });
            if(code === 0) {
                dispatch(reciMessage({
                    convId: user.conv_id,
                    messages: [JSON.parse(json_params)]
                }))
            }
        })
        
    }

    const handleForwardTypePopup = (type) => {
        setForwardTypePopup(false)
        setTransimitPopup(true)
        forwardType = type
    }

    const handleMultiSelectMsg = (params) => {
        setMultiSelect(true)
    }
    const handleSelectMessage = (item) => {
        if(seletedMessage.findIndex(v => getId(v) === getId(item)) > -1 ) {
            const list = seletedMessage.filter(v => getId(v) !== getId(item))
            setSeletedMessage(list)
            console.log("remove:", getId(item))
        } else {
            seletedMessage.push(item)
            setSeletedMessage(Array.from(seletedMessage))
            console.log("add:", getId(item))
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
                    const { message_elem_array, message_sender_profile, message_is_from_self, message_msg_id, message_status } = item;
                    const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = message_sender_profile;
                    const revokedPerson = message_is_from_self ? '你' : user_profile_nick_name;
                    return (
                        <React.Fragment key={message_msg_id}>
                            {
                                message_status === 6 ? (
                                    <div className="message-view__item is-revoked" >
                                        { `${revokedPerson} 撤回了一条消息` }
                                    </div>
                                ) :
                                <div onClick={() => handleSelectMessage(item)} className={`message-view__item ${message_is_from_self ? 'is-self' : ''}`} key={message_msg_id}>
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
                // isForwardTypePopup && 
                // <div className="forward-type-popup">
                //     <Icon type="close" className="forward-type-popup__close" onClick={() => setForwardTypePopup(false)} />
                //     <div className="forward-type-popup__combine" onClick={() => handleForwardTypePopup("combine")}>
                //         <p>合并转发</p>
                //     </div>
                //     <div className="forward-type-popup__divide" onClick={() => handleForwardTypePopup("divide")}>
                //         <p>逐条转发</p>
                //     </div>
                // </div>   
            }
        </div>
    )
};