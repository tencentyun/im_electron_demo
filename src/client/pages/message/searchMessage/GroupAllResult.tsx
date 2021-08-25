import React from 'react';
import { EmptyResult } from './EmptyResult';
import { ResultItem } from './ResultItem';
import './contacter-result.scss';
// 申请入群 zwc
import { joinGroup } from '../../relationship/group/api'
import { message } from 'tea-component'

export const GroupAllResult = (props) => {
    const { result, onClose } = props;

    const handleDirect = async (groupID) => {
      await joinGroup(groupID)
      message.success({
        content: "申请入群成功",
      })
      onClose()
    };
  
    return (
        <div className="contacter-result ">
            {
                result.length ?
                    <div className="customize-scroll-style">
                        {
                            result.map((item, index) => {
                                const { groupName, FaceUrl, groupID,add_optional } = item;
                                return (
                                    <ResultItem
                                        key={index}
                                        isShowBtn={true}
                                        btnText= "申请入群"
                                        faceUrl={FaceUrl}
                                        nickName={groupName}
                                        depName = { groupName }
                                        groupID = { groupID }
                                        addOptional = { add_optional }
                                        submit={(data)=> { handleDirect(data) }}
                                    />
                                )
                            }
                            )
                        }
                    </div>
                    :
                    <EmptyResult />
            }
        </div>
    )
}