import React, { useEffect, useState } from "react";
import { useDialogRef } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { useMessageDirect } from "../../../utils/react-use/useDirectMsgPage";
import "./group-member.scss";
import {
  GroupMemberListDrawer,
  GroupMemberListDrawerRecordsType,
} from "./MemberListDrawer";
import {
  DeleteGroupMemberDialog,
  DeleteMemberRecordsType,
} from "./DeleteGroupMember";
import { getUserTypeQuery } from "../../../services/userType";
import { AddMemberRecordsType, 
  AddGroupMemberDialog } from '../../../components/pull/pull'

import { GroupMemberBubble } from "./GroupMemberBubble";
import { getLoginUserID, getGroupMemberList} from '../api';
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";

export const GroupMember = (props: {
  onRefresh: () => Promise<any>;
  userIdentity: number;
  userId: string;
  groupId: string;
  groupType: number;
  groupAddOption: number;
}): JSX.Element => {
  const {
    groupId,
    groupType,
    userIdentity,
  } = props;


  // 获取群成员列表
  const { value, loading, retry } = useAsyncRetryFunc(async () => {
      return await getGroupMemberList({
        groupId,
        nextSeq: 0,
      })
  }, []);
  const userList: any = value?.group_get_memeber_info_list_result_info_array || [];
  const addMemberDialogRef = useDialogRef<AddMemberRecordsType>();  
  // const userList: any = value?.group_get_memeber_info_list_result_info_array || [];
  const popupContainer = document.getElementById("messageInfo");
  const dialogRef = useDialogRef<GroupMemberListDrawerRecordsType>();
  const elem_type = useDialogRef<AddMemberRecordsType>();

  const deleteMemberDialogRef = useDialogRef<DeleteMemberRecordsType>();

  const memberList = userList?.filter(
    (item) => ![2, 3].includes(item.group_member_info_member_role)
  );

  // 可拉人进群条件为 群类型不为直播群且当前群没有设置禁止加入
  console.log("可拉人进群条件为 群类型不为直播群且当前群没有设置禁止加入", groupType)
  const canInviteMember = [0, 1, 2].includes(groupType);

  /**
   * 对于私有群：只有创建者可删除群组成员。
   * 对于公开群和聊天室：只有管理员和群主可以踢人。
   * 对于直播大群：不能踢人
   * 用户身份类型 memberRoleMap
   * 群类型  groupTypeMap
   */
  const canDeleteMember =
    (groupType === 1 && userIdentity === 3) ||
    ([0, 2].includes(groupType) && [2, 3].includes(userIdentity));

  const directToMsgPage = useMessageDirect();

  // 双击与群成员建立单独会话
  const handleMsgGroupRead = async (profile) => {
    directToMsgPage({
      convType: 1,
      profile: profile,
    });
  };
  useEffect(() => {
    getUsetGroupStatus();
  }, [userList]);

  const [userGroupType, setUserGroupType] = useState([]);

  // 获取当前群内好友状态
  const getUsetGroupStatus = async () => {
    if (userList.length <= 0) {
      return;
    }
    // const sdkappid = "1400529075";
    // const uid = "YANGGUANG37";
    const uid = await getLoginUserID();
    const To_Account = ["denny1", "denny2"];
    userList.forEach((i) => {
      To_Account.push(i.group_member_info_identifier);
    });

    getUserTypeQuery({ uid, To_Account })
      .then((data) => {
        if (data.ErrorCode === 0) {
          console.warn(1);
          setUserGroupType(data.queryResult);
        }
      })
      .catch((err) => {
        console.warn("返回错误信息", err);
      });
  };

  const isOnInternet = (id) => {
    let buuer = false;
    userGroupType.forEach((i) => {
      if (i.To_Account === id && i.Status === "Online") {
        buuer = true;
      }
    });
    return buuer;
  };
  console.warn("所有群成员", userList, "获取的群状态数据", userGroupType);

  return (
    <>
      <div className="group-member">
        <div className="group-member--title">
          <span>群成员</span>
          {userList.length ? (
            <span
              className="group-member--title__right"
              onClick={() => dialogRef.current.open({ memberList: userList })}
            >
              <span style={{ marginRight: "4px" }}>{userList.length}人</span>
              <a>查看</a>
            </span>
          ) : (
            <></>
          )}
        </div>
        <div className="group-member--avatar">
          {JSON.parse(JSON.stringify(userList))?.reverse().slice(0, 15)?.map((v, index) => (
            <div
              className="group-member--avatar-box"
              key={`${v.group_member_info_face_url}-${index}`}
              onDoubleClick={(e) => {
                handleMsgGroupRead(v);
              }}
            >
              <GroupMemberBubble
                user={v}
                children={
                  <>
                    <Avatar
                      url={v.group_member_info_face_url}
                      isClick = {false}
                      key={ v.group_member_info_face_url }
                      isPreview={true}
                      nickName={v.group_member_info_nick_name}
                      userID={v.group_member_info_identifier}
                    />
                  </>
                }
              />
              {
                   <span className='group-member--avatar-identity'>
                     {
                        v.group_member_info_member_role == 3 ? "群主" : v.group_member_info_member_role == 2 ? "管理员" : ""
                     }
                   </span>
              }
              <span
                title={
                  isOnInternet(v.group_member_info_identifier) ? "在线" : "离线"
                }
                className={[
                  "group-member--avatar-type",
                  !isOnInternet(v.group_member_info_identifier)
                    ? "group-member--avatar-typeoff"
                    : "",
                ].join(" ")}
              ></span>
              <div className ="group-member--avatar-name">
                {
                   v.group_member_info_name_card  || v.group_member_info_nick_name
                }
              </div> 
            </div>
          ))}
          {canInviteMember && (
            <span
              className="group-member--add"
              onClick={() => addMemberDialogRef.current.open({ groupId })}
            ></span>
          )}
          {canDeleteMember && memberList.length ? (
            <span
              className="group-member--delete"
              onClick={() =>
                deleteMemberDialogRef.current.open({
                  groupId,
                  userList: memberList,
                })
              }
            ></span>
          ) : (
            <></>
          )}
        </div>
      </div>

      <GroupMemberListDrawer
        popupContainer={popupContainer}
        dialogRef={dialogRef}
        userGroupType={userGroupType}
      />
      <DeleteGroupMemberDialog
        dialogRef={deleteMemberDialogRef}
        onSuccess={() => retry()}
      />
      <AddGroupMemberDialog
        dialogRef={addMemberDialogRef}
        onSuccess={() => retry()}
      />
    </>
  );
};
