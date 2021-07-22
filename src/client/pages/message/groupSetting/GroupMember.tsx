import React, { useEffect, useState } from 'react';
import { useDialogRef } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';
import "./group-member.scss";
import {
  GroupMemberListDrawer,
  GroupMemberListDrawerRecordsType,
} from "./MemberListDrawer";
import {
  AddMemberRecordsType,
  AddGroupMemberDialog,
} from "./AddGroupMemberDialog";
import {
  DeleteGroupMemberDialog,
  DeleteMemberRecordsType,
} from "./DeleteGroupMember";
import { getUserTypeQuery } from '../../../services/userType'

export const GroupMember = (props: {
  userList: {
    user_profile_face_url: string;
    user_profile_nick_name: string;
    group_member_info_member_role: number;
    user_profile_identifier: string;
  }[];
  onRefresh: () => Promise<any>;
  userIdentity: number;
  userId: string;
  groupId: string;
  groupType: number;
  groupAddOption: number;
}): JSX.Element => {
  const {
    userList,
    groupId,
    groupType,
    groupAddOption,
    userId,
    userIdentity,
    onRefresh,
  } = props;

  const popupContainer = document.getElementById("messageInfo");

  const dialogRef = useDialogRef<GroupMemberListDrawerRecordsType>();

  const addMemberDialogRef = useDialogRef<AddMemberRecordsType>();

  const deleteMemberDialogRef = useDialogRef<DeleteMemberRecordsType>();

  const memberList = userList?.filter(
    (item) => ![2, 3].includes(item.group_member_info_member_role)
  );

  // 可拉人进群条件为 群类型不为直播群且当前群没有设置禁止加入
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
    })
  };
  useEffect(() => {
    getUsetGroupStatus();
  }, [userList]);

  const [ userGroupType, setUserGroupType ] = useState([]);

  // 获取当前群内好友状态
  const getUsetGroupStatus = () => {
    if (userList.length <= 0) {
      return
    }
    // const sdkappid = "1400529075";
    const uid = "YANGGUANG37";
    const To_Account = ["denny1", "denny2"];
    userList.forEach((i) => {
        To_Account.push(i.user_profile_identifier)
    })

    getUserTypeQuery({ uid, To_Account }).then(data => {
      if (data.ErrorCode === 0) {
        console.warn(1)
        setUserGroupType(data.queryResult)
      }
    }).catch(err => {
      console.warn('返回错误信息', err)
    })
  }

  const isOnInternet = (id)=>{
    let buuer = false;
    userGroupType.forEach(i=>{
      if(i.To_Account === id && i.Status === 'Online'){
        buuer = true 
      }
    })
    return buuer
  };

  console.warn('所有群成员', userList, '获取的群状态数据', userGroupType)

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
          {userList?.slice(0, 15)?.map((v, index) => (
            <div className="group-member--avatar-box" key={`${v.user_profile_face_url}-${index}`} onDoubleClick={() => { handleMsgGroupRead(v) }}>
              <Avatar
                key={`${v.user_profile_face_url}-${index}`}
                url={v.user_profile_face_url}
                nickName={v.user_profile_nick_name}
                userID={v.user_profile_identifier}
              />
              <span title={isOnInternet(v.user_profile_identifier) ? '在线' : '离线'}
                  className={['group-member--avatar-type', !isOnInternet(v.user_profile_identifier) ? 'group-member--avatar-typeoff' : ''].join(' ')}
                >
              </span>
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
        onSuccess={() => onRefresh()}
      />
      <AddGroupMemberDialog
        dialogRef={addMemberDialogRef}
        onSuccess={() => onRefresh()}
      />
    </>
  );
};
