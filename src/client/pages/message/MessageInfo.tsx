import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron";

import { Avatar } from "../../components/avatar/avatar";
import { getMsgList, markMessageAsRead } from "./api";
import { MessageInput } from "./MessageInput";
import { MessageView } from "./MessageView";

import "./message-info.scss";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../store/actions/message";

import { AddUserPopover } from "./AddUserPopover";
import { addTimeDivider } from "../../utils/addTimeDivider";

import {
  changeDrawersVisible,
  changeToolsTab,
} from "../../store/actions/groupDrawer";
import { GroupToolsDrawer } from "./GroupToolsDeawer";
import { GroupToolBar } from "./GroupToolBar";

type Info = {
  faceUrl: string;
  nickName: string;
};

export const MessageInfo = (props: State.conversationItem): JSX.Element => {
  const { conv_id, conv_type, conv_profile } = props;
  const {
    group_detial_info_group_type: groupType,
    group_detial_info_add_option: addOption,
  } = conv_profile;

  const isShutUpAll =
    conv_type === 2 && conv_profile.group_detial_info_is_shutup_all;

  const { historyMessageList } = useSelector(
    (state: State.RootState) => state.historyMessage
  );
  const { toolsTab, toolsDrawerVisible } = useSelector(
    (state: State.RootState) => state.groupDrawer
  );

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
        if (!message_msg_id) {
          return;
        }
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
  
  const handleOpenCallWindow = () => {
    ipcRenderer.send("openCallWindow");
  }

  const popupContainer = document.getElementById("messageInfo");

  useEffect(() => {
    setMessageRead();
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
            <div>
              {canInviteMember ? <AddUserPopover groupId={conv_id} /> : <></>}
              <span className="message-info-view__header--video" onClick={handleOpenCallWindow} />
            </div>
          </header>
          <section className="message-info-view__content">
            <div className="message-info-view__content--view">
              <MessageView messageList={msgList || []} />
            </div>
            <div className="message-info-view__content--input">
              <MessageInput
                convId={conv_id}
                convType={conv_type}
                isShutUpAll={isShutUpAll}
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
    </>
  );
};
