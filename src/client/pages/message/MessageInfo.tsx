import React, { useEffect } from "react";

import { Avatar } from '../../components/avatar/avatar';
import { getMsgList, markMessageAsRead } from './api';
import { MessageInput } from './MessageInput';
import { MessageView } from './MessageView';

import './message-info.scss';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../../store/actions/message';

import { AddUserPopover } from "./AddUserPopover";

type Info = {
  faceUrl: string;
  nickName: string;
};

export const MessageInfo = (props: State.conversationItem): JSX.Element => {

    const { conv_id, conv_type } = props;
    const { historyMessageList } = useSelector((state: State.RootState) => state.historyMessage);
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
        return info;
    }

    const setMessageRead = () => {
        // 个人会话且未读数大于0才设置已读
        const handleMsgReaded = async () => {
            try {
                const { message_msg_id } = msgList[0];
                const { code, ...res } = await markMessageAsRead(conv_id, conv_type, message_msg_id);
                if (code === 0) {
                    console.log("设置会话已读成功");
                } else {
                    console.log("设置会话已读失败",code, res);
                }
            } catch (err) {
                console.log("设置会话已读失败", err);
            }
        }
        
        if(props.conv_unread_num > 0) {
            handleMsgReaded();
        }
    }

    const { faceUrl,nickName } = getDisplayConvInfo();
    const dispatch = useDispatch();

    useEffect(() => {
        setMessageRead();
    }, [msgList]);

  useEffect(() => {
    const getMessageList = async () => {
      const messageResponse = await getMsgList(conv_id, conv_type);
      const payload = {
          convId: conv_id,
          message: messageResponse
      }
      dispatch(addMessage(payload));
    };
    if (conv_id && !msgList) {
      getMessageList();
    }
  }, [conv_id]);
  
  return (
    <div className="message-info">
      <header className="message-info__header">
        <div className="message-info__header--avatar">
          <Avatar
            url={faceUrl}
            size="small"
            nickName={nickName}
            userID={conv_id}
            groupID={conv_id}
          />
          <span className="message-info__header--name">
            {nickName || conv_id}
          </span>
        </div>
        {conv_type === 2 ? <AddUserPopover /> : <></>}
      </header>
      <section className="message-info__content">
        <div className="message-info__content--view">
          <MessageView messageList={msgList || []} />
        </div>
        <div className="message-info__content--input">
          <MessageInput convId={conv_id} convType={conv_type} />
        </div>
      </section>
    </div>
  );
};
