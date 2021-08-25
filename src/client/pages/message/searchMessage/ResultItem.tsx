import React from 'react';
import { Avatar } from '../../../components/avatar/avatar';
import { Button } from 'tea-component'
import './result-item.scss';

type Props = {
    faceUrl: string;
    nickName: string;
    lastMsg?: State.message;
    userID?:string;
    groupID?:string;
    depName?: string;
    btnText?:string;
    isShowBtn?:boolean;
    submit?:Function;
    onClick?: () => void;
}

export const ResultItem = (props: Props): JSX.Element => {
    const { faceUrl,  nickName, lastMsg, onClick,userID,groupID ,depName, btnText, isShowBtn = false, submit} = props;

    return (
        <div className='result-content'>
          <div className="result-item" onClick={onClick} >
                <Avatar url={faceUrl}  key={ faceUrl } userID={userID} nickName={nickName} groupID={groupID}/>
                <span className="result-item__nick-name">{nickName}</span>
                {
                    depName && !isShowBtn ? <span className="result-item__dep-name">{depName}</span> : null
                }
        </div>
        {
            isShowBtn && <Button type="primary" onClick={()=> submit(groupID)}>
                {btnText}
            </Button>
        }
        </div>
    )
};