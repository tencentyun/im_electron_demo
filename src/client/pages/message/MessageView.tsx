import React from 'react';

import { Avatar } from '../../components/avatar/avatar';
import RightClickMenu from '../../components/RightClickMenu';

import './message-view.scss';

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

const TextElementItem = ({text_elem_content}) => <span className="message-view__item--text text right-menu-item">{text_elem_content}</span>;

export  const MessageView = (props: Props): JSX.Element => {
    const { messageList } = props;

    return (
        <div className="message-view">
            {
                messageList.length > 0 &&
                messageList.map(item => {
                    const { message_elem_array, message_sender_profile,  message_is_from_self } = item;
                    const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = message_sender_profile;
                    return <div className={`message-view__item ${message_is_from_self ? 'is-self' : ''}`} key={item.message_msg_id}>
                        <div className="message-view__item--avatar face-url">
                            <Avatar url={user_profile_face_url} size="small" nickName={user_profile_nick_name} userID={user_profile_identifier} />
                        </div>
                        {
                            message_elem_array.map((elment,index) => {
                                const { elem_type, ...res } = elment;
                                if(elem_type === 0 ){
                                    return <TextElementItem key={ index } {...res} />
                                }
                            })
                        }
                    </div>
                })
            }
            <RightClickMenu>
                {
                    RIGHT_CLICK_MENU_LIST.map(({id, text}) => {
                        return (
                            <div className="right-click__item" key={id}>
                                <span>{text}</span>
                            </div>
                        )
                    })
                }
            </RightClickMenu>
        </div>
    )
};