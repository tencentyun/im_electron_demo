import React from 'react';
import { Avatar } from '../../../components/avatar/avatar';

import './result-item.scss';

type Props = {
    faceUrl: string;
    nickName: string;
    lastMsg?: State.message;
    onClick?: () => void;
}

export const ResultItem = (props: Props): JSX.Element => {
    const { faceUrl,  nickName, lastMsg, onClick} = props;

    return (
        <div className="result-item" onClick={onClick} >
            <Avatar url={faceUrl}  key={ faceUrl }/>
            <span className="result-item__nick-name">{nickName}</span>
        </div>
    )
};