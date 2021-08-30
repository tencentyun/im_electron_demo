import React from 'react';

import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';
import { ResultItem } from './ResultItem';
import { getJoinedGroupList } from '../../relationship/group/api'
import {
    message
  } from "tea-component";

import './group-result.scss';

export const GroupResult = (props) => {
    const { result, onClose,myGroupId } = props;
    const directToMsgPage = useMessageDirect();

    const handleItemClick = (profile) => {
                if(myGroupId.length){
                    let someUserList = myGroupId.some(item => item == profile.group_base_info_group_id)
                    if(someUserList){
                        directToMsgPage({
                            convType: 2,
                            profile,
                            beforeDirect: onClose
                        })
                        return true
                    }
                }
        message.warning({
            content: "您不是群成员无法访问！ ",
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
                                    groupID = { group_base_info_group_id }
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