import React, { useEffect, useState } from 'react';

import { Avatar } from '../../components/avatar/avatar';
import { getMsgList } from './api';
import { MessageInput } from './MessageInput';
import { MessageView } from './MessageView';

import './message-info.scss';


type Props = {
    convId: string,
    convType: number,
    convProfile: {
        faceUrl: string,
        name: string,
    },
};

export const MessageInfo = (props: Props): JSX.Element => {
    const [messageList, setMessageList ] = useState([]);
    const { convProfile: {faceUrl, name}, convId, convType  } = props;
    useEffect(() => {
        const getMessageList = async () => {
            const messageResponse = await getMsgList(convId, convType);
            setMessageList(messageResponse);
        }
        getMessageList();
    }, [convId, convType]);

    return (
        <div className="message-info">
            <header className="message-info__header">
                <Avatar url={faceUrl} size="small" nickName = {name} userID = {convId} groupID = {convId}/>
                <span className="message-info__header--name">{name || convId}</span>
            </header>
            <section className="message-info__content">
                <div className="message-info__content--view">
                   <MessageView messageList={messageList} />
                </div>
                <div className="message-info__content--input">
                    <MessageInput convId={convId} convType={convType}/>
                </div>
            </section>
        </div>
    )
};