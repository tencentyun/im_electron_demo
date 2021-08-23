import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { Drawer, H3, Table, Input, Modal } from "tea-component";
import { isWin } from "../../../utils/tools";
import React, { useState, useEffect, useRef } from "react";
import "./member-list-drawer.scss";
import { modifyGroupMemberInfo } from "../api";
import _ from 'lodash';
import { useSelector } from "react-redux";
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

  const [isShowInput, setIsShowInput] = useState("")
  const [input, setInput] = useState("");
  const [visible, setShowState, defaultForm] =
    useDialog<GroupMemberListDrawerRecordsType>(dialogRef, {});

  const memberList = defaultForm.memberList;

  const onClose = () => {
    setShowState(false);
  };

  const { mygroupInfor} = useSelector(
    (state: State.RootState) => state.section
);


  //更改成员群昵称
  const updataGroupName = (data) => {
    setIsShowInput(data.group_member_info_identifier)
    setInput(data.group_member_info_name_card)
    console.log("更改成员群昵称", data)
  }

  const handleModify = async (groupId, userId, card) => {
    await modifyGroupMemberInfo({
      groupId,
      userId,
      modifyGroupMemberParams: {
        group_modify_member_info_name_card: card,
      },
    });
  };

  const columns = [
    {
      header: "",
      key: "member",
      render: (record: any) => {
        const isAdmin = record.group_member_info_member_role === 2;
        const isOwner = record.group_member_info_member_role === 3;
        const shouldShowTitle = isAdmin || isOwner;
        return (
          <div className="member-list-drawer--item">
            <Avatar
              url={record.group_member_info_face_url}
              nickName={record.group_member_info_nick_name}
              userID={record.group_member_info_identifier}
            />
            <div>
              <div className="member-list-drawer--item__name">
                {record.group_member_info_nick_name || record.group_member_info_identifier}
              </div>

              {
                [2,3].includes(mygroupInfor?.group_member_info_member_role) && isShowInput == record.group_member_info_identifier ? <Input
                  className="group-name-card--input member-list-drawer--item__name"
                  size="full"
                  maxLength={50}
                  autoFocus
                  placeholder="输入成员昵称失焦确定"
                  value={input}
                  onChange={(value) => {
                    setInput(value)
                  }}
                  onBlur={async () => {
                    if(input == record.group_member_info_name_card){
                      setIsShowInput("")
                      return false
                    }
                    const yes = await Modal.confirm({
                      message: "确认修改当前用户群昵称？",
                      description: "修改后，此用户讲在此群显示此群昵称！",
                      okText: "确定",
                      cancelText: "取消",
                    });
                    if (yes) {
                      //调用修改群名片接口
                      handleModify(record.group_member_info_group_id, record.group_member_info_identifier, input)
                    }
                    setIsShowInput("")
                  }}
                /> :
                  <span className="member-list-drawer--item__name" title='群昵称' onClick={() => updataGroupName(record)} style={{ cursor: 'pointer' }}>
                    {record.group_member_info_name_card || "暂无"}
                  </span>
              }

            </div>
            {shouldShowTitle && (
              <span className="member-list-drawer--item__owner">{isOwner ? '群主' : '管理员'}</span>
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
