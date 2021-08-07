import React from "react";
import { Avatar } from "../../../components/avatar/avatar";
import { useMessageDirect } from "../../../utils/react-use/useDirectMsgPage";
import "./group-member.scss";
import { Bubble, Button } from "tea-component";
import timRenderInstance from "../../../utils/timRenderInstance";

export const GroupMemberBubble = (props: {
  user: {
    user_profile_face_url: string;
    user_profile_nick_name: string;
    group_member_info_member_role: number;
    user_profile_identifier: string;
    user_profile_gender: string;
  };
  children: any;
}): JSX.Element => {
  const {
    user,
    children
  } = props;

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
  };

  return (
    <Bubble
        trigger="click"
        placement={"right-start"}
        content={
          <div className="card-content">
            <div className="main-info">
              <div className="info-item">
                <Avatar
                  key={user.user_profile_face_url}
                  url={user.user_profile_face_url}
                  isPreview={true}
                  nickName={user.user_profile_nick_name}
                  userID={user.user_profile_identifier}
                />
                <div className="nickname">{user.user_profile_nick_name || ''}</div>
              </div>
            </div>
            <div className="info-bar">
              <span className="info-key">姓名</span>
              <span className="info-val nickname">{user.user_profile_nick_name || ''}</span>
            </div>
            <div className="info-bar">
              <span className="info-key">性别</span>
              <span className="info-val">{user.user_profile_gender == '1' ? '男' : (user.user_profile_gender == '2' ? '女' : '暂无')}</span>
            </div>
            <div className="info-bar">
              <Button type="primary" onClick={() => handleMsgReaded([user.user_profile_identifier])} style={{ width: "100%" }}>
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
