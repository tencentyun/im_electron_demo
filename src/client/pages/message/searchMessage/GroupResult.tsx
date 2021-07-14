import React from 'react';

import { Avatar } from '../../../components/avatar/avatar';
import { EmptyResult } from './EmptyResult';

import './group-result.scss';

export const GroupResult = (props) => {
    const { result } = props;
    return (
        <div className="group-result customize-scroll-style">
            {
                result.length > 0 ? result.map((item, index) => {
                    const { group_detial_info_face_url,  group_detial_info_group_name } = item;
                    return (
                        <div className="group-result__item" key={index}>
                            <Avatar url={group_detial_info_face_url} />
                            <span className="group-result__item--nick-name">{group_detial_info_group_name}</span>
                        </div>
                    )
                }):
                <EmptyResult />
            }
        </div>
    )
}