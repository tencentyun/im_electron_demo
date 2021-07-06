import React, { FC } from 'react';
import { RouteComponentProps } from "react-router-dom";

interface Props extends RouteComponentProps {
}

export const Setting: FC<Props> = ({ history }) => {
    return (
        <div> 
            I am Setting page!
        </div>
    )
}