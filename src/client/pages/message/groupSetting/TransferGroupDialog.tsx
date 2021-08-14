import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { Drawer, H3, Table, message, PopConfirm, Button} from "tea-component";
import { isWin } from "../../../utils/tools";
import _ from 'lodash';
import { modifyGroupInfo } from "../api";
import { getGroupMemberList } from "../api";
import React, { useEffect, useRef, useState } from "react";

import "./member-list-drawer.scss";

const { scrollable } = Table.addons;

export interface GroupMemberListDrawerRecordsType {
  groupId: string;
}

export const TransferGroupDialog = (props: {
  onSuccess?: () => void;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupMemberListDrawerRecordsType>;
}): JSX.Element => {
  const height = window.innerHeight - 77 - (isWin() ? 30 : 0);
  const { dialogRef, popupContainer } = props;

  const [visible, setShowState, defaultForm] =
    useDialog<GroupMemberListDrawerRecordsType>(dialogRef, {});
  const ref = useRef({firstCall: true}); 
  const [memberList, setMemberList] = useState([]);
  const [nextSeq, setNextSeq] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEnd,setIsEnd] = useState(false)
  const getMemberList = async (seq: number) => {
    if(isEnd){
      return
    }
    try {
      setLoading(true);
      const res = await getGroupMemberList({
        groupId: defaultForm.groupId,
        nextSeq: seq,
      });
      const {
        group_get_memeber_info_list_result_info_array: userList,
        group_get_memeber_info_list_result_next_seq: newNextSeq,
      } = res;
      if(newNextSeq === 0){
        setIsEnd(true)
      }
      setMemberList((pre) => _.differenceBy([...pre, ...userList]));
      setNextSeq(newNextSeq);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const onClose = () => {
    setShowState(false);
  };


    const onOk = async (UID) => {
    try {
      await modifyGroupInfo({
        groupId: defaultForm.groupId,
        modifyParams: {
          group_modify_info_param_owner: UID,
        },
      });
      message.success({ content: '转让成功' })
    } catch (e) {
      message.error({ content: '转让失败' + e })
    }
  };

  const columns = [
    {
      header: "",
      key: "member",
      render: (record: any) => {
        const isOwner = record.group_member_info_member_role === 3;
        return (
          <PopConfirm
          title="确定要转让群主？"
          key={record.group_member_info_identifier}
          message="转移后，群主会将转到给当前选中？"
          footer={close => (
            <>
              <Button
                type="link"
                onClick={() => {
                  close();
                  onOk(record.group_member_info_identifier)
                }}
              >
                确定
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
          </PopConfirm>
        );
      },
    },
  ];

  const onScrollBottom = () => {
    if (loading || nextSeq === 0) {
      return;
    }
    getMemberList(nextSeq);
  };

  useEffect(() => {
    if(ref.current.firstCall && visible) {
      ref.current.firstCall = false;
      getMemberList(0);
    }
  }, [visible]);

  return (
    <Drawer
      visible={visible}
      title={
        <div className="member-list-drawer--title">
          <H3>转让群主</H3>
        </div>
      }
      className="member-list-drawer"
      popupContainer={popupContainer}
      onClose={onClose}
    >
      <Table
        hideHeader
        className="member-list-drawer--table"
        bordered={false}
        columns={columns}
        records={memberList}
        addons={[
          scrollable({
            virtualizedOptions: {
              height,
              itemHeight: 60,
              onScrollBottom,
            },
          }),
        ]}
      />
    </Drawer>
  );
};
