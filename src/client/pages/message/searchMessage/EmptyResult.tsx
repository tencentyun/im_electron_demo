import React from 'react';
import noResultImg from '../../../assets/icon/no-result.png';

import './empty-result.scss';

export const EmptyResult = () => (
    <div className="empty-result">
        <img className="empty-result__img" src={noResultImg}/>
        <span className="empty-result__text">没有找到相关结果, 请重新输入</span>
    </div>
)