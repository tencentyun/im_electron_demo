import React from 'react';

import { Avatar } from '../../components/avatar/avatar';
import { revokeMsg, deleteMsg } from './api';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import './message-view.scss';
import { TextElemItem } from './messageElemTyps/textElemItem';
import { PicElemItem } from './messageElemTyps/picElemItem';
import { CustomElem } from './messageElemTyps/customElem';
import { VoiceElem } from './messageElemTyps/voiceElem';
import { FileElem } from './messageElemTyps/fileElem';

type TextElement = {
    elem_type: number;
    text_elem_content: string;
}

type FaceElement = {
    elem_type: number;
    face_elem_index: number;
    face_elem_buf: string;
}

type LocationElement = {
    elem_type: number;
    location_elem_desc: string;
    location_elem_longitude: number;
    location_elem_latitude: number;
}

type PhotoElement = {
    elem_type: number;
    image_elem_orig_path: string;
    image_elem_level: number;
    image_elem_format: number;
    image_elem_orig_id: string;
    image_elem_orig_pic_height: number;
    image_elem_orig_pic_width: number;
    image_elem_orig_pic_size: number;
    image_elem_thumb_id: string;
    image_elem_thumb_pic_height: number;
    image_elem_thumb_pic_width: number;
    image_elem_thumb_pic_size: number;
    image_elem_large_id: string;
    image_elem_large_pic_height: number;
    image_elem_large_pic_size: number;
    image_elem_large_pic_width: number;
    image_elem_orig_url: string;
    image_elem_thumb_url: number;
    image_elem_large_url: number;

}

type MessageList<T> = {
    message_elem_array: Array<T>,
    message_is_from_self: boolean,
    message_conv_id: string,
    message_conv_type: number;
    message_msg_id: string,
    message_sender_profile: {
        user_profile_identifier: string;
        user_profile_nick_name: string;
        user_profile_face_url: string
    }
}

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

    const handleRevokeMsg = async (params) => {
        const { convId, msgId, convType } = params;
        revokeMsg({
            convId,
            convType,
            msgId
        })

    };

    const handleDeleteMsg = async (params) => {
        const { convId, msgId, convType } = params;
        deleteMsg({
            convId,
            convType,
            msgId
        })
    };

    const handlRightClick = (e, { id, msgId, convId, convType }) => {
        switch (id) {
            case 'revoke':
                handleRevokeMsg({
                    msgId,
                    convId,
                    convType
                });
                break;
            case 'delete':
                handleDeleteMsg({
                    msgId,
                    convId,
                    convType
                });
                break;
        }
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
                resp = <div>群组系统消息</div>
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
                resp = <div>视频消息</div>
                break;
            case 10:
                resp = <div>关系消息</div>
                break;
            case 11:
                resp = <div>资料消息</div>
                break;
            case 12:
                resp = <div>合并消息</div>
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
                messageList.length > 0 &&
                messageList.map(item => {

                    const { message_elem_array, message_sender_profile, message_is_from_self, message_msg_id, message_conv_id, message_conv_type } = item;
                    const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = message_sender_profile;
                    return <div className={`message-view__item ${message_is_from_self ? 'is-self' : ''}`} key={message_msg_id}>
                        <div className="message-view__item--avatar face-url">
                            <Avatar url={user_profile_face_url} size="small" nickName={user_profile_nick_name} userID={user_profile_identifier} />
                        </div>
                        {
                            message_elem_array && message_elem_array.length && message_elem_array.map((elment, index) => {
                                return (
                                    <div className="message-view__item--element" key={index}>
                                        <ContextMenuTrigger id={`same_unique_identifier_${index}`}  >
                                            {
                                                displayDiffMessage(elment)
                                            }
                                        </ContextMenuTrigger>
                                        <ContextMenu id={`same_unique_identifier_${index}`} className="right-menu ">
                                            {
                                                RIGHT_CLICK_MENU_LIST.map(({ id, text }) => {
                                                    return (
                                                        <MenuItem className="right-click__item" key={id} data={{ id, msgId: message_msg_id, convId: message_conv_id, convType: message_conv_type }} onClick={handlRightClick}>
                                                            {text}
                                                        </MenuItem>
                                                    )
                                                })
                                            }
                                        </ContextMenu>
                                    </div>
                                )
                            })
                        }
                        <div className="message-view__item--blank"></div>
                    </div>
                })
            }
        </div>
    )
};