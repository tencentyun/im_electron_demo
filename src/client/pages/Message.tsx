import React, { FC } from 'react';
import { RouteComponentProps } from "react-router-dom";
import timRenderInstance from '../utils/timRenderInstance';

type Props = RouteComponentProps

export const Message: FC<Props> = ({ history }) => {
    const handleClick = async () => {
       const {data: {json_param}} = await timRenderInstance.TIMConvGetConvList({
        userData:'22TIMConvGetConvList2',
    });
       console.log(JSON.parse(json_param));
    };

    return (
        <div> 
            <button onClick={handleClick}>get message list</button>
            <button onClick={handleClick}>create cov list</button>
            I am Message page!
        </div>
    )
}