import React, { useEffect, useState } from 'react';

import { Avatar } from '../../components/avatar/avatar';
import { getMsgList, markMessageAsRead } from './api';
import { MessageInput } from './MessageInput';
import { MessageView } from './MessageView';

import './message-info.scss';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../../store/actions/message';


type Info = {
    faceUrl:string,
    nickName:string,
 
}

export const MessageInfo = (props: State.conversationItem): JSX.Element => {

    const { conv_id, conv_type, conv_last_msg  } = props;
    const { message_msg_id } = conv_last_msg;
    const { historyMessageList } = useSelector((state: State.RootState) => state.historyMessage);

    const getDisplayConvInfo = ()=> {
        const info:Info = {
            faceUrl:'',
            nickName:''
        }

        if(conv_type === 1){
            info.faceUrl = props.conv_profile.user_profile_face_url
            info.nickName = props.conv_profile.user_profile_nick_name
        }
        if(conv_type === 2){
            info.faceUrl = props.conv_profile.group_detial_info_face_url
            info.nickName = props.conv_profile.group_detial_info_group_name
        }
        return info
    }
    const setMessageRead = ()=>{
        // 个人会话且未读数大于0才设置已读
        if(props.conv_unread_num > 0) {
            markMessageAsRead(conv_id,conv_type,message_msg_id).then(({ code,...res })=>{
                if(code === 0){
                    console.log("设置会话已读成功")
                }else{
                    console.log("设置会话已读失败",code, res)
                }
            }).catch(err=>{
                console.log("设置会话已读失败", err)
            })
        }
    }
    const { faceUrl,nickName } = getDisplayConvInfo();
    const dispatch = useDispatch();

    useEffect(() => {
        const getMessageList = async () => {
            const messageResponse = await getMsgList(conv_id, conv_type);
            const msgMap = new Map()
            msgMap.set(conv_id,messageResponse)
            setMessageRead()
            dispatch(addMessage(msgMap))
        }
        if(conv_id){
            getMessageList();
        }
    }, [conv_id]);

    return (
        <div className="message-info">
            <header className="message-info__header">
                <Avatar url={faceUrl} size="small" nickName = {nickName} userID = {conv_id} groupID = {conv_id}/>
                <span className="message-info__header--name">{nickName || conv_id}</span>
            </header>
            <section className="message-info__content">
                <div className="message-info__content--view">
                   <MessageView messageList={historyMessageList.get(conv_id)||[]} />
                </div>
                <div className="message-info__content--input">
                    <MessageInput convId={conv_id} convType={conv_type}/>
                </div>
            </section>
        </div>
    )
};