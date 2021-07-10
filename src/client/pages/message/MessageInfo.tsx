import React from 'react';

import { Avatar } from '../../components/avatar/avatar';
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
    const { convProfile: {faceUrl, name}, convId } = props;
    return (
        <div className="message-info">
            <header className="message-info__header">
                <Avatar url={faceUrl} size="small" nickName = {name} userID = {convId} groupID = {convId}/>
                <span className="message-info__header--name">{name || convId}</span>
            </header>
            <section className="message-info__content">
                <div className="message-info__content--view">
                    message view
                </div>
                <div className="message-info__content--input">
                    message input
                </div>
            </section>
        </div>
    )
};