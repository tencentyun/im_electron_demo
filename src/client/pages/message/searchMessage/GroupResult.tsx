import React from 'react';

import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';
import { ResultItem } from './ResultItem';
import { getGroupMemberList } from '../api'
import {
    message
  } from "tea-component";

import './group-result.scss';

export const GroupResult = (props) => {
    const { result, onClose } = props;
    const directToMsgPage = useMessageDirect();

    const handleItemClick =async (profile) => {
        const list = await getGroupMemberList({
            groupId: profile.group_base_info_group_id
        });
        if(list.group_get_memeber_info_list_result_info_array){
            const arr = list.group_get_memeber_info_list_result_info_array
                if(arr.length){
                let someUserList =  arr.some(item => item.group_member_info_identifier == localStorage.getItem('uid'))
                someUserList &&  directToMsgPage({
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
                            const { group_detial_info_face_url,  group_detial_info_group_name } = item;
                            return (
                                <ResultItem 
                                    key={index}
                                    faceUrl={group_detial_info_face_url}
                                    nickName={group_detial_info_group_name}
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