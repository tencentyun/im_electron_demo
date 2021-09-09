import React, { useState } from 'react';
import { Avatar } from '../../../components/avatar/avatar';
import { Button, PopConfirm, TextArea } from 'tea-component'
import './result-item.scss';

type Props = {
    faceUrl: string;
    nickName: string;
    lastMsg?: State.message;
    userID?: string;
    groupID?: string;
    depName?: string;
    myGroupId?: Array<string>;
    btnText?: string;
    addOptional?: number;
    isShowBtn?: boolean;
    submit?: Function;
    onClick?: () => void;
}

enum TIMGroupAddOption {
    "禁止加群",  // 
    "需管理员审批",    // 
    "任何人都可以加群",     // 
};

export const ResultItem = (props: Props): JSX.Element => {
    const [text, setText] = useState("")
    const { faceUrl, nickName, lastMsg, onClick, userID, groupID, depName, btnText, isShowBtn = false, submit, addOptional = -1, myGroupId } = props;

    return (
        <div className='result-content'>
            <div className="result-item" onClick={onClick} >
                <Avatar url={faceUrl} key={faceUrl} userID={userID} nickName={nickName} groupID={groupID} />
                <span className="result-item__nick-name">{nickName}</span>
                {
                    depName && !isShowBtn ? <span className="result-item__dep-name">{depName}</span> : null
                }
            </div>
            {
                isShowBtn &&
                <div className='result-right'>
                    <div className='result-right__test'>
                        {TIMGroupAddOption[addOptional] || "未知"}
                    </div>
                    {
                        addOptional > 0 &&
                        (
                            myGroupId.some(item => item == groupID) ?
                                <Button type="pay" >
                                    本群成员
                                </Button> :
                                <PopConfirm
                                    title="确定需要申请加入吗？"
                                    message={
                                        addOptional == 1 ?
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: '64px' }}>
                                                    申请原因：
                                                </div>
                                                <TextArea
                                                    showCount
                                                    maxLength={50}
                                                    value={text}
                                                    onChange={(value, context) => {
                                                        setText(value);
                                                    }}
                                                    placeholder="请输入申请原因"
                                                />
                                            </div>
                                            : "此群为任意加入，申请加入后，将直接进入本群。"

                                    }
                                    footer={close => (
                                        <>
                                            <Button
                                                type="primary"
                                                onClick={() => {
                                                    close();
                                                    addOptional == 1 ? submit(groupID, depName, text) : submit(groupID, depName, "")
                                                }}
                                            >
                                                申请加入
                                            </Button>
                                            <Button
                                                type="text"
                                                onClick={() => {
                                                    close();
                                                }}
                                            >
                                                取消
                                            </Button>
                                        </>
                                    )}
                                >
                                    <Button type="primary" onClick={() => {
                                        setText("")
                                    }}>
                                        {btnText}
                                    </Button>
                                </PopConfirm>
                        )
                    }
                </div>
            }
        </div>
    )
};