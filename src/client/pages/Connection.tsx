import React, { FC } from 'react';
import { RouteComponentProps } from "react-router-dom";

interface Props extends RouteComponentProps {
}

export const Connection: FC<Props> = ({ history }) => {


    return (
        <div> 
            I am Connection page!
        </div>
    )
}