import React, { useEffect, useRef, useState } from "react";
import { message } from 'tea-component';

import { Avatar } from "../../components/avatar/avatar";
import { getGroupMemberList, getMsgList, markMessageAsRead, getUserInfoList } from "./api";
import { MessageInput } from "./MessageInput";
import { MessageView } from "./MessageView";

import "./message-info.scss";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../store/actions/message";
import { updateCallingStatus } from "../../store/actions/ui";

import { AddUserPopover } from "./AddUserPopover";
import { addTimeDivider } from "../../utils/addTimeDivider";
import { generateRoomID } from "../../utils/tools";
import { openCallWindow, callWindowCloseListiner } from '../../utils/callWindowTools';
import trtcCheck from '../../utils/trtcCheck';

import {
  changeDrawersVisible,
  changeToolsTab,
} from "../../store/actions/groupDrawer";
import { GroupToolsDrawer } from "./GroupToolsDeawer";
import { GroupToolBar } from "./GroupToolBar";
import timRenderInstance from "../../utils/timRenderInstance";
import { GroupMemberSelector } from "./groupMemberSelector";

type Info = {
  faceUrl: string;
  nickName: string;
};

export const MessageInfo = (props: State.conversationItem): JSX.Element => {
  const { conv_id, conv_type, conv_profile } = props;
  const [callType,setCallType] = useState(0)
  const [callInfo,setCallInfo] = useState({
    callType:0,
    convType:0
  })
  const {
    group_detial_info_group_type: groupType,
    group_detial_info_add_option: addOption,
  } = conv_profile;
  const groupMemberSelectorRef = useRef(null)
  const isShutUpAll =
    conv_type === 2 && conv_profile.group_detial_info_is_shutup_all;

  const { historyMessageList } = useSelector(
    (state: State.RootState) => state.historyMessage
  );
  const { toolsTab, toolsDrawerVisible } = useSelector(
    (state: State.RootState) => state.groupDrawer
  );

  const { callingStatus: { callingId, callingType } } = useSelector(
    (state: State.RootState) => state.ui
  );

  const { userId, userSig } = useSelector((state: State.RootState) => state.userInfo)
  const msgList = historyMessageList.get(conv_id);
  const getDisplayConvInfo = () => {
    const info: Info = {
      faceUrl: "",
      nickName: "",
    };

    if (conv_type === 1) {
      info.faceUrl = props.conv_profile.user_profile_face_url;
      info.nickName = props.conv_profile.user_profile_nick_name;
    }

    if (conv_type === 2) {
      info.faceUrl = props.conv_profile.group_detial_info_face_url;
      info.nickName = props.conv_profile.group_detial_info_group_name;
    }
    return info;
  };
  const validatelastMessage = (messageList: State.message[]) => {
    let msg: State.message;
    for (let i = 0; i < messageList.length; i++) {
      // 筛选不是自己的且发送成功的消息
      if (
        messageList[i]?.message_msg_id &&
        !messageList[i].message_is_from_self &&
        messageList[i].message_status === 2
      ) {
        // 不能是群系统通知
        const { elem_type } = messageList[i].message_elem_array[0] || {};
        if (elem_type != 5 && elem_type != 8) {
          msg = messageList[i];
          break;
        }
      }
    }
    return msg;
  };
  const setMessageRead = () => {
    // 个人会话且未读数大于0才设置已读
    const handleMsgReaded = async () => {
      if (!msgList || msgList.length === 0) {
        return;
      }
      try {
        const { message_msg_id } = validatelastMessage(msgList) || {};
        const { code, ...res } = await markMessageAsRead(
          conv_id,
          conv_type,
          message_msg_id
        );

        if (code === 0) {
          console.log("设置会话已读成功");
        } else {
          console.log("设置会话已读失败", code, res);
        }
      } catch (err) {
        console.log("设置会话已读失败", err);
      }
    };

    // if (props.conv_unread_num > 0) {
    handleMsgReaded();
    // }
  };

  const { faceUrl, nickName } = getDisplayConvInfo();
  const dispatch = useDispatch();

  // 可拉人进群条件为 当前选中聊天类型为群且群类型不为直播群且当前群没有设置禁止加入
  const canInviteMember = conv_type === 2 && [0, 1, 2].includes(groupType);

  // 设置群信息相关
  const handleClick = (id: string) => dispatch(changeToolsTab(id));

  const handleShow = () => dispatch(changeDrawersVisible(true));
  const handleClose = () => dispatch(changeDrawersVisible(false));

  const inviteC2C = async () => {
    const roomId = generateRoomID();
    const { callType } = callInfo
    const data = await timRenderInstance.TIMInvite({
      userID: conv_id,
      senderID: userId,
      data: JSON.stringify({"businessID":"av_call","call_type":Number(callType),"room_id":roomId,"version":4})
    })
    const { data: { code, json_params } } = data;
    if(code === 0){
      const customerData = JSON.parse(json_params)?.message_elem_array[0].custom_elem_data;
      const inviteId = JSON.parse(customerData)?.inviteID;
      openLocalCallWindow(callType,roomId,[conv_id], inviteId)
    }
  }
  const inviteInGourp =async (groupMember) => {
    const { callType } = callInfo
    const roomId = generateRoomID();
    console.log('roomId',roomId)
    const userList = groupMember.map((v) => v.group_member_info_identifier)
   const data = await timRenderInstance.TIMInviteInGroup({
      userIDs: userList,
      groupID: conv_id,
      senderID: userId,
      data: JSON.stringify({"businessID":"av_call","call_type":Number(callType),"room_id":roomId,"version":4}),
    });
    const { data: { code, json_params } } = data;
    if(code === 0){
      const customerData = JSON.parse(json_params)?.message_elem_array[0].custom_elem_data;
      const inviteId = JSON.parse(customerData)?.inviteID;
      openLocalCallWindow(callType,roomId,userList, inviteId)
    }
  }
  const openLocalCallWindow = async (callType,roomId,userList, inviteId)=>{
    dispatch(updateCallingStatus({
      callingId: conv_id,
      callingType: conv_type,
      inviteeList: userList,
      callType: callType
    }));
    const { faceUrl, nickName } = getDisplayConvInfo();
    const inviteListWithInfo = await getUserInfoList([userId, ...userList]);
    openCallWindow({
      windowType: 'callWindow',
      callType,
      convId: conv_id,
      convInfo: {
        faceUrl: faceUrl,
        nickName: nickName,
        convType: conv_type
      },
      roomId,
      inviteID: inviteId,
      userID: userId,
      userSig: userSig,
      inviteList: userList,
      inviteListWithInfo
    });
  }

  useEffect(()=>{
    const {callType,convType} = callInfo
    if(callType!==0 && convType !== 0){
      if(convType == 1){
        inviteC2C()
      }else if(convType === 2){
        openGroupMemberSelector()
      }
    }
  },[callInfo])
  const handleOpenCallWindow = async (callType, convType) => {
    if (callingId) {
      message.warning({ content: '正在通话中' });
      return;
    }

    if (!trtcCheck.isCameraReady() && !trtcCheck.isMicReady()) {
      message.warning({ content: '找不到可用的摄像头和麦克风。请安装摄像头和麦克风后再试' });
      return;
    }

    setCallInfo({
      callType,
      convType
    })
  }
const openGroupMemberSelector = async ()=>{
  const { group_get_memeber_info_list_result_info_array } = await getGroupMemberList({
    groupId: conv_id,
    nextSeq: 0,
  })
  groupMemberSelectorRef.current.open({
    groupId: conv_id,
    userList: group_get_memeber_info_list_result_info_array
  })
}

  const popupContainer = document.getElementById("messageInfo");

  useEffect(() => {
    setTimeout(() => {
      setMessageRead();
    }, 500)
  }, [msgList]);

  useEffect(() => {
    const getMessageList = async () => {
      const messageResponse = await getMsgList(conv_id, conv_type);
      const addTimeDividerResponse = addTimeDivider(messageResponse.reverse());
      const payload = {
        convId: conv_id,
        messages: addTimeDividerResponse.reverse(),
      };
      dispatch(addMessage(payload));
    };
    if (conv_id && !msgList) {
      getMessageList();
    }
  }, [conv_id]);

  return (
    <>
      <div className="message-info">
        <div className="message-info-view" id="messageInfo">
          <header className="message-info-view__header">
            <div
              className="message-info-view__header--avatar"
              onClick={() => {
                if (conv_type === 2) {
                  if (toolsDrawerVisible) {
                    handleClose();
                    handleClick("");
                  } else {
                    handleShow();
                    handleClick("setting");
                  }
                }
              }}
            >
              <Avatar
                url={faceUrl}
                size="small"
                nickName={nickName}
                userID={conv_id}
                groupID={conv_id}
              />
              <span className="message-info-view__header--name">
                {nickName || conv_id}
              </span>
            </div>
            {canInviteMember ? <AddUserPopover groupId={conv_id} /> : <></>}
          </header>
          <section className="message-info-view__content">
            <div className="message-info-view__content--view">
              <MessageView groupType={groupType} messageList={msgList || []} convId={conv_id} />
            </div>
            <div className="message-info-view__content--input">
              <MessageInput
                convId={conv_id}
                convType={conv_type}
                isShutUpAll={isShutUpAll}
                handleOpenCallWindow={handleOpenCallWindow}
              />
            </div>
          </section>
        </div>
        {conv_type === 2 && (
          <GroupToolBar
            onActive={handleClick}
            onShow={handleShow}
            onClose={handleClose}
          />
        )}
      </div>
      <GroupToolsDrawer
        visible={toolsDrawerVisible}
        toolId={toolsTab}
        conversationInfo={props}
        popupContainer={popupContainer}
        onClose={() => {
          handleClick("");
          handleClose();
        }}
      />
      <GroupMemberSelector dialogRef={groupMemberSelectorRef}
        onSuccess={(data) => {
          inviteInGourp(data)
        }} />
    </>
  );
};
