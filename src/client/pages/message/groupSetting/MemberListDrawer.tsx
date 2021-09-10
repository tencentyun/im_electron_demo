import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Avatar } from "../../../components/avatar/avatar";
import { ipcRenderer } from "electron";
import { Drawer, H3, Table, Input, Modal, Button, PopConfirm } from "tea-component";
import { Spin } from 'antd';
import { isWin } from "../../../utils/tools";
import React, { useState, useEffect, useRef } from "react";
import "./member-list-drawer.scss";
import { modifyGroupMemberInfo, getLoginUserID } from "../api";
import { searchGroupPendency } from '../../relationship/group/api'
import { getUserTypeQuery } from "../../../services/userType";
import _ from 'lodash';
import { useSelector } from "react-redux";
import { Item } from "react-contexify";
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
  groupId?: string;
  isGroupOwner?:boolean;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupMemberListDrawerRecordsType>;
}): JSX.Element => {
  let settime: any;
  const height = window.innerHeight - 27 - (isWin() ? 30 : 0);
   //是否是群主
  const { dialogRef, popupContainer, groupId, isGroupOwner } = props;
  const [userGroupType, setUserGroupType] = useState([]);
  const [isShowInput, setIsShowInput] = useState("")
  const [input, setInput] = useState("");
  const [visible, setShowState, defaultForm] =
    useDialog<GroupMemberListDrawerRecordsType>(dialogRef, {});

  const memberList = defaultForm.memberList;
  const [meberListFormate, setMeberListFormate] = useState([])
  const [tanleLoading, setTanleLoading] = useState(false)
  const onClose = () => {
    setShowState(false);
  };

  useEffect(() => {
    setMeberListFormate(memberList)
  }, [memberList]);

  useEffect(()=>{
    getUsetGroupStatus();
  }, [meberListFormate])

  const { mygroupInfor } = useSelector(
    (state: State.RootState) => state.section
  );

  console.log("meberListFormate", meberListFormate)

  // 获取当前群内好友状态
  const getUsetGroupStatus = async () => {
    if (meberListFormate?.length <= 0) {
      return;
    }
    // const sdkappid = "1400529075";
    // const uid = "YANGGUANG37";
    const uid = await getLoginUserID();
    const To_Account = ["denny1", "denny2"];
    meberListFormate?.forEach((i) => {
      To_Account.push(i.group_member_info_identifier);
    });
    getUserTypeQuery({ uid, To_Account })
      .then((data) => {
        if (data.ErrorCode === 0) {
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

  //更改成员群昵称
  const updataGroupName = (data) => {
    setIsShowInput(data.group_member_info_identifier)
    setInput(data.group_member_info_name_card)
    console.log("更改成员群昵称", data)
  }

    //解除群管理
    const removingAdministrato = async (record, card) => {
      let groupId = record.group_member_info_group_id,
      userId = record.group_member_info_identifier
      setTanleLoading(true)
      await modifyGroupMemberInfo({
        groupId,
        userId,
        modifyGroupMemberParams: {
          group_modify_member_info_member_role: 1,
        },
      });
      setGroupNickName(record, card, true);
      ipcRenderer.send('onRedbawViews', 0 , groupId)
      setTanleLoading(false)
    }

  //更改后更新列表数据
  const setGroupNickName = (data, card, isRole = false) => {
    for (let i = 0; i < meberListFormate.length; i++) {
      let elment = meberListFormate[i]
      if (data.group_member_info_identifier == elment.group_member_info_identifier) {
        isRole ? elment.group_member_info_member_role = 1  : elment.group_member_info_name_card = card
        break;
      }
    }
    console.log("meberListFormate,meberListFormate", meberListFormate)
    setMeberListFormate(meberListFormate)
  }

  //搜索群成员
  const searchPersonnel = async (keyName) => {
    clearTimeout(settime)

    if (keyName) {
      settime = setTimeout(async () => {
        const data = await searchGroupPendency([groupId], [keyName], [2])
        let group_search_member_result_menber_info_list = []
        if (data.length) {
          group_search_member_result_menber_info_list = data[0].group_search_member_result_menber_info_list
        }
        setMeberListFormate(group_search_member_result_menber_info_list)

      }, 500)
    } else {
      setMeberListFormate(memberList)
    }
  }

  const handleModify = async (record, card) => {
    let groupId = record.group_member_info_group_id,
      userId = record.group_member_info_identifier
    setTanleLoading(true)
    await modifyGroupMemberInfo({
      groupId,
      userId,
      modifyGroupMemberParams: {
        group_modify_member_info_name_card: card,
      },
    });
    setGroupNickName(record, card)
    ipcRenderer.send('onRedbawViews', 0, groupId)
    setTanleLoading(false)
  };

  const columns = [
    {
      header: "",
      key: "member",
      render: (record: any) => {
        console.log("record", record)
        const isAdmin = record.group_member_info_member_role === 2;
        const isOwner = record.group_member_info_member_role === 3;
        const shouldShowTitle = isAdmin || isOwner;
        return (
          <div className="member-list-drawer--item">
            <div className='member-offine'>
                <Avatar
                  url={record.group_member_info_face_url}
                  nickName={record.group_member_info_nick_name}
                  userID={record.group_member_info_identifier}
                />
                 <div className={["member-offine__item",isOnInternet(record.group_member_info_identifier) ? 'member-offine__online' : 'member-offine__offline'].join(" ")} 
                 title={isOnInternet(record.group_member_info_identifier) ? '在线' : '离线'}>
                 </div>
            </div>

            <div>
              <div className="member-list-drawer--item__name">
                {record.group_member_info_nick_name || record.group_member_info_identifier}
              </div>
              {
                [2, 3].includes(mygroupInfor ?.group_member_info_member_role) && isShowInput == record.group_member_info_identifier ? <Input
                  className="group-name-card--input member-list-drawer--item__name"
                  size="full"
                  maxLength={50}
                  autoFocus
                  placeholder="输入成员昵称失焦确定1"
                  value={input}
                  onChange={(value) => {
                    setInput(value)
                  }}
                  onBlur={async () => {
                    if (input == record.group_member_info_name_card) {
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
                      handleModify(record, input)
                    }
                    setIsShowInput("")
                  }}
                /> :
                  <span className="member-list-drawer--item__name" title='群昵称' onClick={() => updataGroupName(record)} style={{ cursor: 'pointer' }}>
                    {record.group_member_info_name_card || "暂无"}
                  </span>
              }
              {
                isGroupOwner && record.group_member_info_member_role == 2 &&  <PopConfirm
                title="确定要解除管理员身份？"
                message="解除后，该成员将变为普通成员。"
                footer={close => (
                  <>
                    <Button
                      type="link"
                      onClick={() => {
                        close();
                        //解除管理员  2021年8月20日14:15:27   zwc
                        removingAdministrato(record,record.group_member_info_name_card)
                      }}
                    >
                      解除
            </Button>
                    <Button
                      type="text"
                      onClick={() => {
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
                <Button icon="not" title="解除管理员" />
              </PopConfirm>
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
      {
        !!meberListFormate &&
        <Spin spinning={tanleLoading}>
          <div>
              {
                memberList ?.length > 10 && <Input placeholder="请输入人员名称" onChange={searchPersonnel} style={{ width: '90%', margin: '10px 5%' }} />
              }
          </div>
          <Table
            hideHeader
            disableHoverHighlight
            className="member-list-drawer--table"
            bordered={false}
            columns={columns}
            records={meberListFormate}
            addons={[
              scrollable({
                virtualizedOptions: {
                  height,
                  itemHeight: 60,
                },
              }),
            ]}
          />
        </Spin>
      }

    </Drawer>
  );
};
