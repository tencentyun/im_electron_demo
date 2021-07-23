import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { Drawer, H3, Table } from "tea-component";
import { isWin } from "../../../utils/tools";
import React from "react";
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';

import "./member-list-drawer.scss";

const { scrollable } = Table.addons;

export interface GroupMemberListDrawerRecordsType {
  memberList: any[];
}

export type userTypeData = {
  Status: string,
  To_Account: string
}

export const GroupMemberListDrawer = (props: {
  onSuccess?: () => void;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupMemberListDrawerRecordsType>;
  userGroupType: Array<userTypeData>
}): JSX.Element => {
  const height = window.innerHeight - 77 - (isWin() ? 24 : 0);

  const { dialogRef, popupContainer, userGroupType } = props;

  const [visible, setShowState, defaultForm] =
    useDialog<GroupMemberListDrawerRecordsType>(dialogRef, {});

  const onClose = () => {
    setShowState(false);
  };

  const directToMsgPage = useMessageDirect();

  // 双击与群成员建立单独会话
  const handleMsgGroupRead = async (profile) => {
    directToMsgPage({
      convType: 1,
      profile: profile,
    })
  };

  const isOnInternet = (id)=>{
    let buuer = false;
    userGroupType.forEach(i=>{
      if(i.To_Account === id && i.Status === 'Online'){
        buuer = true 
      }
    })
    return buuer
  };

  const columns = [
    {
      header: "",
      key: "member",
      render: (record: any) => {
        const isOwner = record.group_member_info_member_role === 3;
        return (
          <div className="member-list-drawer--item" onDoubleClick={() => { handleMsgGroupRead(record) }}>
            <Avatar
              url={record.user_profile_face_url}
              nickName={record.user_profile_nick_name}
              userID={record.user_profile_identifier}
            />
            <span title={isOnInternet(record.user_profile_identifier) ? '在线' : '离线'}
                className={['member-list-drawer--item-type', !isOnInternet(record.user_profile_identifier) ? 'member-list-drawer--item-typeoff' : ''].join(' ')}
              >
              </span>
            <span className="member-list-drawer--item__name">
              {record.user_profile_nick_name || record.user_profile_identifier}
            </span>
            {isOwner && (
              <span className="member-list-drawer--item__owner">群主</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Drawer
      visible={visible}
      title={
        <div className="member-list-drawer--title">
          <H3>群成员</H3>
        </div>
      }
      className="member-list-drawer"
      popupContainer={popupContainer}
      onClose={onClose}
    >
      <Table
        hideHeader
        disableHoverHighlight
        className="member-list-drawer--table"
        bordered={false}
        columns={columns}
        records={defaultForm.memberList}
        addons={[
          scrollable({
            virtualizedOptions: {
              height,
              itemHeight: 60,
            },
          }),
        ]}
      />
    </Drawer>
  );
};
