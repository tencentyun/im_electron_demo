import React from 'react';

import { Avatar } from '../../../components/avatar/avatar';
import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';


import './group-result.scss';

export const GroupResult = (props) => {
    const { result, onClose } = props;
    const directToMsgPage = useMessageDirect();

    const handleItemClick = (profile) => {
        directToMsgPage({
            convType: 2,
            profile,
            beforeDirect: onClose
        })
    }

    return (
        <div className="group-result customize-scroll-style">
            {
                result.length > 0 ? result.map((item, index) => {
                    const { group_detial_info_face_url,  group_detial_info_group_name } = item;
                    return (
                        <div className="group-result__item" key={index} onClick={() => handleItemClick(item)}>
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