import React, { useEffect } from "react";
import { message } from 'tea-component';

import { Avatar } from "../../components/avatar/avatar";
import { getMsgList, markMessageAsRead, inviteMemberGroup } from "./api";
import { MessageInput } from "./MessageInput";
import { MessageView } from "./MessageView";

import "./message-info.scss";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../store/actions/message";
import { updateCallingStatus } from "../../store/actions/ui";

import {
  AddGroupMemberDialog,
  AddMemberRecordsType
} from '../../components/pull/pull'

import { AddUserPopover } from "./AddUserPopover";
<<<<<<< HEAD
=======
import { addTimeDivider } from "../../utils/addTimeDivider";
import { openCallWindow, callWindowCloseListiner } from "../../utils/tools";
>>>>>>> origin/main

import { useDialogRef } from "../../utils/react-use/useDialog";
import { addTimeDivider } from "../../utils/addTimeDivider";
import BraftEditor, { EditorState } from 'braft-editor'
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
    group_detial_info_add_option: addOption
  } = conv_profile;

  const popupContainer = document.getElementById("messageInfo");
  const isShutUpAll = conv_type === 2 && conv_profile.group_detial_info_is_shutup_all;

  const addMemberDialogRef = useDialogRef<AddMemberRecordsType>();

  const { historyMessageList } = useSelector(
    (state: State.RootState) => state.historyMessage
  );
  const userTypeList = useSelector((state: State.RootState) => state.userTypeList);
  const [ editorState, setEditorState ] = useState<EditorState>(BraftEditor.createEditorState(null))
  const [ isPress, setIsPress] = useState(false)
  const [ editorHeight, seteditorHeight] = useState(250)
  
  const { toolsTab, toolsDrawerVisible } = useSelector(
    (state: State.RootState) => state.groupDrawer
  );

  const { callingStatus: { callingId, callingType } } = useSelector(
    (state: State.RootState) => state.ui
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
    for (let i = 0;i < messageList.length;i++) {
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
  const reloct = (value: Array<string>) => {
    try {
      if (value.length) {
        console.log(conv_id, value)
        inviteMemberGroup({ groupId: conv_id, UIDS: value })
      }
    } catch (e) {
      console.log(e.message);
    }
  }
  const { faceUrl, nickName } = getDisplayConvInfo();
  const dispatch = useDispatch();

  // 可拉人进群条件为 当前选中聊天类型为群且群类型不为直播群且当前群没有设置禁止加入
  const canInviteMember = conv_type === 2 && [0, 1, 2].includes(groupType);

  // 设置群信息相关
  const handleClick = (id: string) => dispatch(changeToolsTab(id));

  const handleShow = () => dispatch(changeDrawersVisible(true));
  const handleClose = () => dispatch(changeDrawersVisible(false));
<<<<<<< HEAD

  const handleOpenCallWindow = () => {
    ipcRenderer.send("openCallWindow");
  }

=======
  
  const handleOpenCallWindow = (callType) => {
    if(callingId) {
      message.warning({content: '正在通话中'});
      return;
    }
    
    dispatch(updateCallingStatus({
      callingId: conv_id,
      callingType: conv_type
    }));
    openCallWindow({
      callType
    });
  }

  useEffect(() => {
    callWindowCloseListiner(() => {
      dispatch(updateCallingStatus({
        callingId: '',
        callingType: 0
      }));
    });
  }, [])

  const popupContainer = document.getElementById("messageInfo");

>>>>>>> origin/main
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

  const isOnInternet = () => {
    let buuer = false;
    for (const item in userTypeList) {
      // console.warn(userTypeList[item])
      if (userTypeList[item].To_Account === conv_id && userTypeList[item].Status === 'Online') {
        buuer = true
      }
    }
    return buuer
  };

  // 滑动高度判断赋值
  const adjustHeight = (e)=>{
    if(isPress){
      let maxHeight = document.documentElement.clientHeight
      let height = maxHeight - e.clientY
      if(height < 170){
        height = 170
      }else if(height > maxHeight - 150){
        height = maxHeight - 150
      }
      seteditorHeight(height)
    }
  }

  const sliderStyle = ()=>{
    return {
      'height': editorHeight + 'px'
    }
  }

  return (
    <>
      <div className="message-info" onMouseMove={adjustHeight} onMouseUp={()=>setIsPress(false)}>
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
                {
                  conv_type === 1 ?
                  <span title={isOnInternet()?'在线':'离线'} 
                    className={['message-info-view__header--type', !isOnInternet()?'message-info-view__header--typeoff': ''].join(' ')}
                  >
                  </span> : null
              }
            </div>
            <div>
<<<<<<< HEAD
              {/* {canInviteMember ? <AddUserPopover groupId={conv_id} /> : <></>} */}
              {
                canInviteMember && <span title='添加群成员' className="add-icon" onClick={() => addMemberDialogRef.current.open({ groupId: conv_id })} />
              }
              <span className="message-info-view__header--video" onClick={handleOpenCallWindow} />
=======
              {canInviteMember ? <AddUserPopover groupId={conv_id} /> : <></>}
              <span className={`message-info-view__header--video ${callingId === conv_id ? 'is-calling' : ''}`} onClick={() => handleOpenCallWindow('videoCall')} />
>>>>>>> origin/main
            </div>
          </header>
          <section className="message-info-view__content">
            <div className="message-info-view__content--view">
              <MessageView messageList={msgList || []} convId={conv_id} convType={conv_type} editorState={editorState} setEditorState={setEditorState} />
            </div>
            <div className="message-info-view__content--slider" 
              onMouseDown={()=>setIsPress(true)} 
              ></div>
            <div style={{ ...sliderStyle() }}  className="message-info-view__content--input">
              <MessageInput
                convId={conv_id}
                convType={conv_type}
                isShutUpAll={isShutUpAll}
<<<<<<< HEAD
                editorState={editorState}
                setEditorState={setEditorState}
=======
                handleOpenCallWindow={handleOpenCallWindow}
>>>>>>> origin/main
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
      <AddGroupMemberDialog
        dialogRef={addMemberDialogRef}
        onSuccess={(value) => reloct(value)}
      />
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