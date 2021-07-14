import React from 'react';

import { Avatar } from '../../../components/avatar/avatar';

import './group-result.scss';

export const GroupResult = (props) => {
    const { result } = props;
    return (
        <div className="group-result customize-scroll-style">
            {
                result.length > 0 && result.map(item => {
                    const { group_detial_info_face_url,  group_detial_info_group_name } = item;
                    return (
                        <div className="group-result__item">
                            <Avatar url={group_detial_info_face_url} />
                            <span className="group-result__item--nick-name">{group_detial_info_group_name}</span>
                        </div>
                    )
                })
            }
        </div>
    )
}