import React, { FC } from 'react';
import { RouteComponentProps } from "react-router-dom";

type Props = RouteComponentProps

export const Message: FC<Props> = ({ history }) => {


    return (
        <div> 
            I am Message page!
        </div>
    )
}