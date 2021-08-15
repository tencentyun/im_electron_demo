import React from 'react';
import { Avatar } from '../../../components/avatar/avatar';

import './result-item.scss';

type Props = {
    faceUrl: string;
    nickName: string;
    lastMsg?: State.message;
    userID?:string;
    groupID?:string;
    onClick?: () => void;
}

export const ResultItem = (props: Props): JSX.Element => {
    const { faceUrl,  nickName, lastMsg, onClick,userID,groupID} = props;

    return (
        <div className="result-item" onClick={onClick} >
            <Avatar url={faceUrl}  key={ faceUrl } userID={userID} nickName={nickName} groupID={groupID}/>
            <span className="result-item__nick-name">{nickName}</span>
        </div>
    )
};