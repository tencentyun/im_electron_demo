import React, { FC } from 'react';
import { RouteComponentProps } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import {incrementAction, decrementAction} from '../store/actions';

interface Props extends RouteComponentProps {
}

export const Login: FC<Props> = ({ history }) => {
    const dispatch = useDispatch();

    const number = useSelector(state => state);

    const handleLoginClick = () => {
        history.replace('/home');
    }

    const handleIncrement = () => {
        dispatch(incrementAction);
    };

    const handleDecrement = () => {
        dispatch(decrementAction);
    };


    return (
        <div> 
            I am login page!
            <p>current count {number}</p>
            <button onClick={handleIncrement}>Increment</button>
            <button onClick={handleDecrement}>Decrement</button>
            <button onClick={handleLoginClick}>Login</button>
        </div>
    )
}