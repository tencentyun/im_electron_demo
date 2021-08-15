import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { Drawer, H3, Table, SearchBox } from "tea-component";
import { isWin, throttle, highlightText } from "../../../utils/tools";
import React, { useState, useEffect, useRef } from "react";
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';
import { GroupMemberBubble } from "./GroupMemberBubble";
import "./member-list-drawer.scss";
import { getGroupMemberList } from "../api";
import _ from 'lodash';
const { scrollable } = Table.addons;

export interface GroupMemberListDrawerRecordsType {
  memberList: any[];
  groupId: string;
  To_Account: string
}

export type userTypeData = {
  Status: string,
  To_Account: string
}

export const GroupMemberListDrawer = (props: {
  onSuccess?: () => void;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupMemberListDrawerRecordsType>;
}): JSX.Element => {
  const height = window.innerHeight - 77 - (isWin() ? 30 : 0);
  const { dialogRef, popupContainer } = props;

  const [visible, setShowState, defaultForm] =
    useDialog<GroupMemberListDrawerRecordsType>(dialogRef, {});

  const memberList = defaultForm.memberList;

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
            <Avatar
              url={record.group_member_info_face_url}
              nickName={record.group_member_info_nick_name}
              userID={record.group_member_info_identifier}
            />
            <span className="member-list-drawer--item__name">
              {record.group_member_info_nick_name || record.group_member_info_identifier}
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
        records={memberList}
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
