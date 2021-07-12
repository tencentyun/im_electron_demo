import React, { useEffect, useState } from 'react';

import { Avatar } from '../../components/avatar/avatar';
import { getMsgList } from './api';
import { MessageInput } from './MessageInput';
import { MessageView } from './MessageView';

import './message-info.scss';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../../store/actions/message';


type Props = {
    convId: string,
    convType: number,
    convProfile: {
        faceUrl: string,
        name: string,
    },
};

export const MessageInfo = (props: Props): JSX.Element => {

    const { convProfile: {faceUrl, name}, convId, convType  } = props;

    const { historyMessageList } = useSelector((state: State.RootState) => state.historyMessage);
    const dispatch = useDispatch();

    useEffect(() => {
        const getMessageList = async () => {
            const messageResponse = await getMsgList(convId, convType);
            // 更新store
            const msgMap = new Map()
            msgMap.set(convId,messageResponse)
            dispatch(addMessage(msgMap))
        }
        if(convId){
            getMessageList();
        }
    }, [convId]);

    return (
        <div className="message-info">
            <header className="message-info__header">
                <Avatar url={faceUrl} size="small" nickName = {name} userID = {convId} groupID = {convId}/>
                <span className="message-info__header--name">{name || convId}</span>
            </header>
            <section className="message-info__content">
                <div className="message-info__content--view">
                   <MessageView messageList={historyMessageList.get(convId)||[]} />
                </div>
                <div className="message-info__content--input">
                    <MessageInput convId={convId} convType={convType}/>
                </div>
            </section>
        </div>
    )
};