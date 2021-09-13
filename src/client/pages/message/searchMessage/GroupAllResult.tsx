import React from 'react';
import { useSelector } from "react-redux";
import { EmptyResult } from './EmptyResult';
import { ResultItem } from './ResultItem';
import './contacter-result.scss';
// 申请入群 zwc
import { joinGroup } from '../../relationship/group/api'
import { message } from 'tea-component'




export const GroupAllResult = (props) => {
    const { result, onClose } = props;
    const { nickName, userId } = useSelector((state: State.RootState) => state.userInfo);
    const handleDirect = async (groupID, groupName,nickName, text) => {
      await joinGroup(groupID,[groupName,nickName, text])
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
                                        myGroupId={props.myGroupId}
                                        faceUrl={FaceUrl}
                                        nickName={groupName}
                                        depName = { groupName }
                                        groupID = { groupID }
                                        addOptional = { add_optional }
                                        submit={(groupID, groupName, text)=> { handleDirect(groupID, groupName, nickName, text) }}
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