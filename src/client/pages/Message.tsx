import React, { FC } from 'react';
import { RouteComponentProps } from "react-router-dom";

interface Props extends RouteComponentProps {
}

export const Message: FC<Props> = ({ history }) => {


    return (
        <div> 
            I am Message page!
        </div>
    )
}