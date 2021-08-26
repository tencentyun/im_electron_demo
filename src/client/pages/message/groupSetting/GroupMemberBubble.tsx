import React from "react";
import { Avatar } from "../../../components/avatar/avatar";
import { useMessageDirect } from "../../../utils/react-use/useDirectMsgPage";
import "./group-member.scss";
import { Bubble, Button, PopConfirm } from "tea-component";
import timRenderInstance from "../../../utils/timRenderInstance";

export const GroupMemberBubble = (props: {
  user: {
    group_member_info_face_url: string;
    group_member_info_nick_name: string;
    group_member_info_member_role: number;
    group_member_info_identifier: string;
    group_member_info_name_card: string;
  };
  isGroupOwner:boolean;
  removingAdministrato:Function;
  children: any;
}): JSX.Element => {
  const {
    user,
    children,
    isGroupOwner = false,
    removingAdministrato
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
                key={user.group_member_info_face_url}
                url={user.group_member_info_face_url}
                isPreview={false}
                nickName={user.group_member_info_nick_name}
                userID={user.group_member_info_identifier}
              />
              <div className="nickname">{user.group_member_info_nick_name || ''}</div>
            </div>
              {
                isGroupOwner && user.group_member_info_member_role == 2 &&  <PopConfirm
                title="确定要解除管理员身份？"
                message="解除后，该成员将变为普通成员。"
                footer={close => (
                  <>
                    <Button
                      type="link"
                      onClick={() => {
                        close();
                        //解除管理员  2021年8月20日14:15:27   zwc
                        removingAdministrato(user.group_member_info_identifier)
                      }}
                    >
                      解除
            </Button>
                    <Button
                      type="text"
                      onClick={() => {
                        close();
                        console.log("已取消");
                      }}
                    >
                      取消
            </Button>
                  </>
                )}
                placement="top-start"
              >
                <Button icon="not" title="解除管理员" />
              </PopConfirm>
              }
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
