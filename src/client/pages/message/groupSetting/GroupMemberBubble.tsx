import React from "react";
import { Avatar } from "../../../components/avatar/avatar";
import { useMessageDirect } from "../../../utils/react-use/useDirectMsgPage";
import "./group-member.scss";
import { Bubble, Button } from "tea-component";
import timRenderInstance from "../../../utils/timRenderInstance";
import { getConversionList } from '../api'
import { replaceConversaionList, updateCurrentSelectedConversation } from '../../../store/actions/conversation';
import { useDispatch } from 'react-redux';
export const GroupMemberBubble = (props: {
  user: {
    group_member_info_face_url: string;
    group_member_info_nick_name: string;
    group_member_info_member_role: number;
    group_member_info_identifier: string;
    group_member_info_name_card: string;
  };
  children: any;
}): JSX.Element => {
  const {
    user,
    children
  } = props;
  const dispatch = useDispatch();
  const directToMsgPage = useMessageDirect();

  const handleMsgReaded = async (UserId: Array<string>) => {
    const {
      data: { code, json_param },
    } = await timRenderInstance.TIMProfileGetUserProfileList({
      json_get_user_profile_list_param: {
        friendship_getprofilelist_param_identifier_array: UserId,
      },
    });
    directToMsgPage({
      convType: 1,
      profile: JSON.parse(json_param)[0],
    });
    // getData()
  };
  // const getData = async () => {
  //   const response = await getConversionList();
  //   dispatch(replaceConversaionList(response))
  //   if (response.length) {
  //     dispatch(updateCurrentSelectedConversation(response[0]))
  //   } else {
  //     dispatch(updateCurrentSelectedConversation(null))
  //   }
  // }
  return (
    <Bubble
      trigger="click"
      placement={"right-start"}
      content={
        <div className="card-content">
          <div className="main-info">
            <div className="info-item">
              <Avatar
                key={user.group_member_info_face_url}
                url={user.group_member_info_face_url}
                isPreview={false}
                nickName={user.group_member_info_nick_name}
                userID={user.group_member_info_identifier}
              />
              <div className="nickname">{user.group_member_info_nick_name || ''}</div>
            </div>
          </div>
          <div className="info-bar">
            <span className="info-key">姓名</span>
            <span className="info-val nickname">{user.group_member_info_nick_name || ''}</span>
          </div>
          <div className="info-bar">
            <span className="info-key">群昵称</span>
            <span className="info-val">{user.group_member_info_name_card ? user.group_member_info_name_card : '暂无'}</span>
          </div>
          <div className="info-bar">
            <Button type="primary" onClick={() => handleMsgReaded([user.group_member_info_identifier])} style={{ width: "100%" }}>
              发消息
            </Button>
          </div>
        </div>
      }
    >
      {
        children
      }
      <span></span>
    </Bubble>
  );
};
