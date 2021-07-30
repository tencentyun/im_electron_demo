import React from 'react';

import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';
import { ResultItem } from './ResultItem';


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
        <div className="group-result">
            {
                result.length > 0 ? 
                <div className="group-result__content customize-scroll-style">
                    {
                         result.map((item, index) => {
                            const { group_detial_info_face_url,  group_detial_info_group_name, group_base_info_group_id } = item;
                            return (
                                <ResultItem 
                                    key={index}
                                    faceUrl={group_detial_info_face_url}
                                    nickName={group_detial_info_group_name || group_base_info_group_id}
                                    onClick={() => handleItemClick(item)}
                                />
                            )
                        })
                    }
                </div>
               :
                <EmptyResult />
            }
        </div>
    )
}