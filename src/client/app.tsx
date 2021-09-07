import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "tea-component/dist/tea.css";
import "antd/dist/antd.css";
import {
  HashRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";

import store from "./store";

import { Login } from "./pages/login";
import { Home } from "./pages/home";
import "./assets/_basic.scss";
import timRenderInstance from "./utils/timRenderInstance";
import { ToolsBar } from "./components/toolsBar/toolsBar";

import "./app.scss";
import initListeners from "./imLiseners";
import {
  setUnreadCount,
  updateConversationList,
  markConvLastMsgIsReaded,
  updateCurrentSelectedConversation,
  replaceConversaionList,
  deleteConversion,
} from "./store/actions/conversation";
import { initGroupInfor } from "./store/actions/section";
import {
  addProfileForConversition,
  getConversionList,
  TIMConvDelete,
} from "./pages/message/api";
import {
  reciMessage,
  markeMessageAsRevoke,
  markMessageAsReaded,
  updateMessages,
  updateMessageElemProgress,
} from "./store/actions/message";
import { setIsLogInAction, userLogout } from "./store/actions/login";
import {
  openCallWindow,
  closeCallWindow,
  remoteUserExit,
  remoteUserJoin,
  acceptCallListiner,
  refuseCallListiner,
  callWindowCloseListiner,
  cancelCallInvite,
  updateInviteList,
} from "./utils/callWindowTools";
import { updateCallingStatus } from "./store/actions/ui";
// import { SERVERr_ADDRESS_IP, SERVERr_ADDRESS_PORT } from "./constants";
import { ipcRenderer } from "electron";
import { reportError } from "./utils/orgin";
import getHuaRunConfig from "./constants";
// eslint-disable-next-line import/no-unresolved
// 引入 electron-store
import eleStore from "electron-store";
const elestore = new eleStore();
let isInited = false;
let joinedUserList = [];

// @ts-ignore
window.closeCallWindow = closeCallWindow;

export const App = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const ref = useRef({
    catchUserId: "",
    catchUserSig: "",
    catchCalling: {
      callingType: 0,
      callingId: "",
      inviteeList: [],
      callType: 0,
    },
  });

  const { callingStatus } = useSelector((state: State.RootState) => state.ui);

  const { userId, userSig } = useSelector(
    (state: State.RootState) => state.userInfo
  );

  ref.current = {
    catchCalling: callingStatus,
    catchUserId: userId,
    catchUserSig: userSig,
  };

  const initIMSDK = async () => {
    if (!isInited) {
      const privite = await timRenderInstance.callExperimentalAPI({
        json_param: {
          request_internal_operation:
            "internal_operation_set_custom_server_info",
          request_set_custom_server_info_param: {
            longconnection_address_array: [
              {
                // server_address_ip: "oaim.crbank.com.cn", // ip 生产
                server_address_ip: getHuaRunConfig.SERVERr_ADDRESS_IP,
                server_address_port: getHuaRunConfig.SERVERr_ADDRESS_PORT, // 端口
              },
            ],
            server_public_key:
              "0436ddd1de2ec99e57f8a796745bf5c639fe038d65f9df155e3cbc622d0b1b75a40ee49074920e56c6012f90c77be69f7f", // 公钥
          },
        },
      });
      console.log("私有化", privite);
      let eleConfig = {
        config_path: elestore.store.chatSetting,
      };
      console.log(eleConfig, "eleConfig ");
      timRenderInstance.TIMInit(eleConfig).then(async ({ data }) => {
        if (data === 0) {
          isInited = true;
          console.log("初始化成功");
          timRenderInstance
            .TIMGetSDKVersion()
            .then((data) => console.log("IMSDK Version", data));
          initListeners((callback) => {
            const { data, type } = callback;
            console.info(
              "======================== 接收到IM事件 start =============================="
            );
            console.log("类型：", type);
            console.log("数据：", data);
            console.info(
              "======================== 接收到IM事件 end =============================="
            );
            switch (type) {
              /**
               * 处理收到消息逻辑
               */
              case "TIMAddRecvNewMsgCallback":
                _handeMessage(data);
                break;
              /**
               * 会话改变
               */
              case "TIMSetConvEventCallback":
                _handleConversaion(data);
                break;
              /**
               * 未读数改变
               */
              case "TIMSetConvTotalUnreadMessageCountChangedCallback":
                _handleUnreadChange(data);
                break;
              /**
               * 消息撤回
               */
              case "TIMSetMsgRevokeCallback":
                _handleMessageRevoked(data);
                break;
              case "TIMSetMsgReadedReceiptCallback":
                _handleMessageReaded(data);
                break;
              /**
               * 群组系统消息回调
               */
              case "TIMSetGroupTipsEventCallback":
                _handleGroupInfoModify(data);
                break;
              /**
               * 元素上传进度回调
               */
              case "TIMSetMsgElemUploadProgressCallback":
                _handleElemUploadProgres(data);
                break;
              /**
               * 被挤下线
               */
              case "TIMSetKickedOfflineCallback":
                _handleKickedout();
                break;
              /**
               * 收到音视频邀请
               */
              case "TIMOnInvited":
                _onInvited(data);
                break;
              /**
               * 自己的邀请被拒绝
               */
              case "TIMOnRejected":
                _onRejected(data);
                break;
              /**
               * 自己的邀请被接收
               */
              case "TIMOnAccepted":
                _onAccepted(data);
                break;
              /**
               * 收到的音视频邀请被取消
               */
              case "TIMOnCanceled":
                _onCanceled(data);
                break;
              /**
               * 收到的音视频邀请已經超时
               */
              case "TIMOnTimeout":
                _onTimeout(data);
                break;
            }
          });
        }
      });
    }
  };

  let showApp = true;
  const handleNotify = (messages) => {
    const msgBother = window.localStorage.getItem("msgBother") || false;
    const msgBother_close =
      window.localStorage.getItem("msgBother_close") || false;
    console.log(showApp, "[[[[[[[[[[[[[[[", msgBother);
    console.log(messages);
    // 客户端没有展示在最顶层或者设置了消息提示免打扰，就不接收消息通知
    if (showApp || msgBother == "false" || msgBother_close == "true") {
      return;
    }
    console.log(
      messages[0].message_elem_array[0],
      "通知消息------------------------------------",
      messages
    );
    const notification = new window.Notification("收到新消息", {
      icon: "http://oaim.crbank.com.cn:30003/emoji/notification.png",
      // body: replaceAll(message.message_elem_array[0], '&nbsp;', ' ').substring(0, 15)
      //设置十个字
      body:
        messages[0].message_elem_array[0].text_elem_content.length > 9
          ? messages[0].message_elem_array[0].text_elem_content.substring(0, 10)
          : messages[0].message_elem_array[0].text_elem_content,
    });
    ipcRenderer.send("asynchronous-message", "setTaryTitle");
    notification.onclick = async () => {
      ipcRenderer.send("asynchronous-message", "openWindow");
      dispatch(updateCurrentSelectedConversation(messages));
      const response = await getConversionList();
      dispatch(updateConversationList(response));
      // console.log(response, '对话列表。。。。。。。。。。。。。。。。。。。')
      if (response?.length) {
        const newConversaionItem = response.find(
          (v) => v.conv_id === messages[0].message_conv_id
        );
        if (newConversaionItem) {
          dispatch(updateCurrentSelectedConversation(newConversaionItem));
        }
      }
      notification.close();
    };
  };
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  const replaceAll = (str, match, replacement) => {
    return str.replace(new RegExp(escapeRegExp(match), "g"), () => replacement);
  };
  const _onInvited = (data) => {
    // actionType: 1
    // businessID: 1
    // data: "{\"version\":0,\"call_type\":1,\"room_id\":30714513}"
    // groupID: ""
    // inviteID: "19455b33-c8fc-4fef-ab60-9347ebea78cc"
    // inviteeList: ["3708"]
    // inviter: "109442"
    // timeout: 30

    const formatedData = JSON.parse(
      JSON.parse(data)[0].message_elem_array[0].custom_elem_data
    );
    const { room_id, call_type, call_end } = JSON.parse(formatedData.data);
    const { inviter, groupID, inviteID, inviteeList } = formatedData;
    const { callingId, callType } = ref.current.catchCalling;
    // 如果正在通话，拒绝对方通话。
    if (callingId) {
      timRenderInstance.TIMRejectInvite({
        inviteID: inviteID,
        data: JSON.stringify({
          version: 4,
          businessID: "av_call",
          call_type: callType,
        }),
      });
      return;
    }
    if (call_end >= 0) {
      return;
    }
    timRenderInstance
      .TIMProfileGetUserProfileList({
        json_get_user_profile_list_param: {
          friendship_getprofilelist_param_identifier_array: [
            inviter,
            ...inviteeList,
          ],
          friendship_getprofilelist_param_force_update: false,
        },
      })
      .then(async (data) => {
        const { catchUserId, catchUserSig } = ref.current;
        if (!catchUserId) {
          return;
        }
        const {
          data: { code, json_param },
        } = data;
        if (code === 0) {
          const inviteListWithInfo = JSON.parse(json_param);
          const inviterInfo = inviteListWithInfo.filter(
            (item) => item.user_profile_identifier === inviter
          );
          dispatch(
            updateCallingStatus({
              callingId: groupID ? groupID : inviter, //
              callingType: groupID ? 2 : 1,
              inviteeList: [inviter, ...inviteeList],
              callType: call_type,
            })
          );
          openCallWindow({
            windowType: "notificationWindow",
            callType: call_type + "",
            convId: groupID ? groupID : inviter,
            convInfo: {
              faceUrl: inviterInfo.user_profile_face_url,
              nickName: inviterInfo.user_profile_nick_name || inviter,
              convType: groupID ? 2 : 1,
            },
            roomId: room_id,
            inviteID,
            userID: catchUserId,
            inviteList: [inviter, ...inviteeList],
            inviteListWithInfo: [...inviteListWithInfo],
            userSig: catchUserSig,
            isInviter: false,
          });
        }
      });
  };
  const _removeFromArr = (arr: any[], target: any) => {
    for (let i = 0; i < arr.length; i++) {
      if ((arr[i] = target)) {
        arr.splice(i, 1);
        break;
      }
    }
    return arr;
  };
  const _onRejected = (data) => {
    data && _handleRemoteUserReject(JSON.parse(data)[0]);
  };
  const _onAccepted = (data) => {
    console.log("============accept call=======", data);
  };
  const _onCanceled = (data) => {
    // 关闭通知窗口
    closeCallWindow();
    clearCallStore();
  };
  const _onTimeout = (data) => {
    if (data) {
      const parsedData = JSON.parse(data);
      const params = Array.isArray(parsedData) ? parsedData[0] : parsedData;
      _handleRemoteUserTimeOut(params);
    }
  };

  const _handleRemoteUserTimeOut = (message) => {
    const timeOutList = JSON.parse(
      message.message_elem_array[0].custom_elem_data
    )?.inviteeList;
    console.warn("====timeout params=====", timeOutList);
    if (timeOutList) {
      const { callingId, callingType, inviteeList, callType } =
        ref.current.catchCalling;
      const catchUserId = ref.current.catchUserId;
      const newList = inviteeList.filter((item) => !timeOutList.includes(item));
      const isEmpty =
        newList.filter((item) => item !== catchUserId).length === 0;
      dispatch(
        updateCallingStatus({
          callingId,
          callingType,
          inviteeList: newList,
          callType,
        })
      );
      if (isEmpty) {
        closeCallWindow();
      } else {
        updateInviteList(newList); //向通话窗口通信
      }
    }
  };

  const _handleRemoteUserReject = (message) => {
    const { message_sender } = message;
    const { callingId, callingType, inviteeList, callType } =
      ref.current.catchCalling;
    const catchUserId = ref.current.catchUserId;
    if (inviteeList.includes(message_sender)) {
      const newInviteeList = inviteeList.filter(
        (item) => item !== message_sender
      );
      const isEmpty =
        newInviteeList.filter((item) => item !== catchUserId).length === 0;
      dispatch(
        updateCallingStatus({
          callingId,
          callingType,
          inviteeList: newInviteeList,
          callType,
        })
      );
      if (isEmpty) {
        closeCallWindow();
      } else {
        updateInviteList(newInviteeList); //向通话窗口通信
      }
    }
  };

  const _handleElemUploadProgres = ({
    message,
    index,
    cur_size,
    total_size,
    user_data,
  }) => {
    dispatch(
      updateMessageElemProgress({
        messageId: message.message_msg_id,
        index,
        cur_size,
        total_size,
      })
    );
  };

  const _handleKickedout = async () => {
    dispatch(userLogout());
    history.replace("/login");
    dispatch(setIsLogInAction(false));
  };

  let initNumber = 0;
  const _handleGroupInfoModify = async (data) => {
    const response = await getConversionList();
    dispatch(updateConversationList(response));
    if (response?.length) {
      const newConversaionItem = response.find(
        (v) => v.conv_id === data.group_tips_elem_group_id
      );
      if (newConversaionItem) {
        dispatch(updateCurrentSelectedConversation(newConversaionItem));
        //修改群身份触发群聊详情更新
        newConversaionItem?.conv_last_msg?.message_elem_array[0]?.elem_type ==
          5 && dispatch(initGroupInfor(initNumber++));
      }
    }
    console.log("======data=======", data);

    //新需求可以加上，但是这里面不要去处理会话的逻辑了

    // const response = await getConversionList();
    // dispatch(updateConversationList(response));
    // if (response?.length) {
    //     const newConversaionItem = response.find(
    //         (v) => v.conv_id === data.group_tips_elem_group_id
    //     );
    //     if (newConversaionItem) {
    //         dispatch(updateCurrentSelectedConversation(newConversaionItem));
    //     }
    // }
  };
  const handleMessageSendFailed = (convList) => {
    const failedList = convList.reduce((acc, cur) => {
      if (cur.conv_last_msg && cur?.conv_last_msg.message_status === 3) {
        const key = cur.conv_id;
        const value = acc[key]
          ? acc[key].push(cur.conv_last_msg)
          : [cur.conv_last_msg];
        return {
          ...acc,
          [key]: value,
        };
      }
    }, {});

    if (!failedList) return;
    for (const i in failedList) {
      dispatch(
        updateMessages({
          convId: i,
          message: failedList[i][0],
        })
      );
    }
  };
  const _handleUnreadChange = (unreadCount) => {
    dispatch(setUnreadCount(unreadCount));
  };
  const updateConversation = async () => {
    const response = await getConversionList();
    dispatch(replaceConversaionList(response));
    if (response.length) {
      dispatch(updateCurrentSelectedConversation(response[0]));
    }
  };
  const _handeMessage = (messages: State.message[]) => {
    // 收到新消息，如果正在聊天，更新历史记录，并设置已读，其他情况没必要处理
    try {
      // getData()
      handleNotify(messages);
    } catch (error) {
      console.log(error);
    }
    const obj = {};
    for (let i = 0; i < messages.length; i++) {
      if (!obj[messages[i].message_conv_id]) {
        obj[messages[i].message_conv_id] = [];
      }
      obj[messages[i].message_conv_id].push(messages[i]);
      // 处理被踢出群
      try {
        const { message_elem_array, message_conv_id, message_conv_type } =
          messages[i];
        for (let j = 0; j < message_elem_array.length; j++) {
          const { elem_type, group_report_elem_report_type } =
            message_elem_array[j];
          if (
            elem_type === 8 &&
            [4, 5, 8].includes(group_report_elem_report_type)
          ) {
            // 删除会话
            TIMConvDelete(message_conv_id, message_conv_type).then((data) => {
              updateConversation();
            });
          }
        }
      } catch (err) {}
    }

    for (const i in obj) {
      dispatch(
        reciMessage({
          convId: i,
          messages: obj[i],
        })
      );
    }
  };
  const _handleConversaion = (conv) => {
    const { type, data } = conv;
    switch (type) {
      /**
       * 新增会话
       */
      case 0:
        console.log("新增会话");
        _updateConversation(data);
        break;
      /**
       * 删除会话
       */
      case 1:
        console.log("删除会话");
        break;
      /**
       * 会话同步完成
       */
      case 2:
        console.log("同步会话完成");
        _updateConversation(data);
        break;
      /**
       * 会话开始同步
       */
      case 3:
        console.log("开始同步会话");
        break;
      /**
       * 会话更新
       */
      case 4:
        console.log("会话更新");
        break;
    }
  };
  const _updateConversation = async (
    conversationList: Array<State.conversationItem>
  ) => {
    if (conversationList.length) {
      const convList = await addProfileForConversition(conversationList);
      dispatch(updateConversationList(convList));
      // 更新失败消息上屏
      try {
        handleMessageSendFailed(convList);
      } catch (err) {
        console.error(err);
      }
      // if (conversationList[0]?.conv_last_msg?.message_status === 1) {
      const elemType =
        conversationList[0].conv_last_msg?.message_elem_array?.[0]?.elem_type;
      console.log(elemType);
      if (elemType === 9 || elemType === 3) {
        dispatch(
          updateMessages({
            convId: conversationList[0].conv_id,
            message: conversationList[0].conv_last_msg,
          })
        );
        //elemType4,文件上传存在延时，但视图已经更新，利用渲染进程发给主进程再发给主进程进行通信
        //解决上传失败等问题 瞎几把写！
        // ipcRenderer.send("RENDERPROCESSCALL", "upload_reset_view");
      }
      // }
    }
  };

  const _handleMessageRevoked = (data) => {
    data.forEach((item) => {
      const {
        message_locator_conv_id: convId,
        message_locator_unique_id: messageId,
      } = item;
      dispatch(
        markeMessageAsRevoke({
          convId,
          messageId,
        })
      );
    });
  };

  const clearCallStore = () => {
    dispatch(
      updateCallingStatus({
        callingId: "",
        callingType: 0,
        inviteeList: [],
        callType: 0,
      })
    );
    joinedUserList = [];
  };

  const _handleMessageReaded = (data) => {
    const c2cDdata = data.filter((item) => item.msg_receipt_conv_type === 1);
    const convIds = c2cDdata.map((item) => item.msg_receipt_conv_id);
    if (c2cDdata.length > 0) {
      dispatch(markConvLastMsgIsReaded(c2cDdata));
      dispatch(markMessageAsReaded({ convIds }));
    }
  };
  const onError = (err) => {
    const { catchUserId } = ref.current;
    reportError({
      errorText: err.message,
      userID: catchUserId,
    });
  };
  const addErrorReport = () => {
    window.addEventListener("error", onError);
  };
  const removeReport = () => {
    window.removeEventListener("error", onError);
  };
  const ipcRendererLister = (event, data) => {
    if (event) {
      // console.log('changedata:', data)
      showApp = data;
      // console.log(showApp, 'showApp')
    }
  };
  useEffect(() => {
    initIMSDK();
    ipcRenderer.on("mainProcessMessage", ipcRendererLister);
    addErrorReport();
    acceptCallListiner((inviteID) => {
      const { callType } = ref.current.catchCalling;
      timRenderInstance
        .TIMAcceptInvite({
          inviteID: inviteID,
          data: JSON.stringify({
            version: 4,
            businessID: "av_call",
            call_type: callType,
          }),
        })
        .then((data) => {
          console.log("接收返回", data);
        });
    });
    refuseCallListiner((inviteID) => {
      const { callType } = ref.current.catchCalling;
      timRenderInstance
        .TIMRejectInvite({
          inviteID: inviteID,
          data: JSON.stringify({
            version: 4,
            businessID: "av_call",
            call_type: callType,
          }),
        })
        .then((data) => {
          console.log("接收返回", data);
        });
    });
    callWindowCloseListiner(clearCallStore);
    cancelCallInvite(({ inviteId, realCallTime }) => {
      if (!inviteId) {
        return;
      }
      const { callingId, inviteeList, callType, callingType } =
        ref.current.catchCalling;
      const catchUserId = ref.current.catchUserId;
      const callingUserList = joinedUserList.filter(
        (item) => item !== catchUserId
      );
      const isAllUserRejectOrTimeout =
        inviteeList.filter((item) => item !== catchUserId).length === 0;
      if (realCallTime === 0) {
        // 如果点击挂断，此时没有用户接听，需要取消邀请
        if (!isAllUserRejectOrTimeout) {
          timRenderInstance
            .TIMCancelInvite({
              inviteID: inviteId,
              data: JSON.stringify({
                version: 4,
                businessID: "av_call",
                call_type: callingType,
              }),
            })
            .then((data) => {
              console.log("关闭邀请===", data);
            });
        }
      } else {
        // 如果自己是最后一个挂断电话的需要发送通话时长
        if (callingUserList.length === 0) {
          if (callingType === 1) {
            timRenderInstance.TIMInvite({
              userID: callingId,
              timeout: 0,
              senderID: catchUserId,
              data: JSON.stringify({
                businessID: "av_call",
                call_end: realCallTime,
                call_type: Number(callType),
                version: 4,
              }),
            });
          } else {
            timRenderInstance
              .TIMInviteInGroup({
                userIDs: callingUserList,
                groupID: callingId,
                timeout: 0,
                senderID: catchUserId,
                data: JSON.stringify({
                  businessID: "av_call",
                  call_end: realCallTime,
                  call_type: Number(callType),
                  version: 4,
                }),
              })
              .then(() => {
                console.log("===========data======");
              });
          }
        }
      }
    });

    remoteUserExit((userId) => {
      const { callingId, callingType, inviteeList, callType } =
        ref.current.catchCalling;
      const catchUserId = ref.current.catchUserId;
      const newList = inviteeList.filter((item) => item !== userId);
      const isEmpty =
        newList.filter((item) => item !== catchUserId).length === 0;
      joinedUserList = [...newList];
      if (isEmpty) {
        closeCallWindow();
        return;
      }
      dispatch(
        updateCallingStatus({
          callingId,
          callingType,
          inviteeList: newList,
          callType,
        })
      );
    });

    remoteUserJoin((userId) => {
      joinedUserList.push(userId);
    });
  }, []);
  useEffect(() => {
    //电脑锁屏
    ipcRenderer.on("mainProcessLockScreen", (event, data) => {
      console.log(data);
      if (data) {
        window.localStorage.setItem("msgBother_close", "true");
      } else {
        window.localStorage.setItem("msgBother_close", "false");
      }
    });
    return () => {
      ipcRenderer.removeListener("mainProcessMessage", ipcRendererLister);
      removeReport();
    };
  }, []);
  return (
    <div id="app-container">
      {/* <ToolsBar></ToolsBar> */}
      <Switch>
        <Route path="/home" component={Home}></Route>
        <Route path="/" component={Login} />
      </Switch>
    </div>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);
