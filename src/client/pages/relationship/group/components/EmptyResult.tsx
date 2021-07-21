import React from 'react';
import noResultImg from '../../../../assets/icon/no-result.png';

import './empty-result.scss';

export const EmptyResult = ({contentText = ''}) => (
    <div className="group-list-empty-result">
        <img className="group-list-empty-result__img" src={noResultImg}/>
        <span className="group-list-empty-result__text">{contentText}</span>
    </div>
)