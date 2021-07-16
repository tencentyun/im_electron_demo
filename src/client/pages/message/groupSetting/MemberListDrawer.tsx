import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { Drawer, H3, Table } from "tea-component";
import { isWin } from "../../../utils/tools";
import React from "react";

import "./member-list-drawer.scss";

const { scrollable } = Table.addons;

export interface GroupMemberListDrawerRecordsType {
  memberList: any[];
}

export const GroupMemberListDrawer = (props: {
  onSuccess?: () => void;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupMemberListDrawerRecordsType>;
}): JSX.Element => {

  const height = window.innerHeight - 77 - (isWin() ? 24 : 0);

  const { dialogRef, popupContainer } = props;

  const [visible, setShowState, defaultForm] =
    useDialog<GroupMemberListDrawerRecordsType>(dialogRef, {});

  const onClose = () => {
    setShowState(false);
  };

  const columns = [
    {
      header: "",
      key: "member",
      render: (record: any) => {
        const isOwner = record.group_member_info_member_role === 3;
        return (
          <div className="member-list-drawer--item">
            <Avatar url={record.user_profile_face_url} />
            <span className="member-list-drawer--item__name">{record.user_profile_nick_name}</span>
            {isOwner && <span className="member-list-drawer--item__owner">群主</span>}
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
              itemHeight: 60
            }
          })
        ]}
      />
    </Drawer>
  );
};
