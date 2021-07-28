import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "tea-component/dist/tea.css";
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
} from "./store/actions/conversation";
import {
    addProfileForConversition,
    getConversionList,
} from "./pages/message/api";
import {
    reciMessage,
    markeMessageAsRevoke,
    markMessageAsReaded,
    addMoreMessage,
    updateMessages,
    updateMessageElemProgress,
} from "./store/actions/message";
import { setIsLogInAction, userLogout } from "./store/actions/login";
// eslint-disable-next-line import/no-unresolved
let isInited = false;

export const App = () => {
    const dispatch = useDispatch();

    const history = useHistory();
    const initIMSDK = async () => {
        if (!isInited) {
            //   const privite = await timRenderInstance.callExperimentalAPI({
            //       json_param: {
            //           request_internal_operation: 'internal_operation_set_custom_server_info',
            //           request_set_custom_server_info_param: {
            //             longconnection_address_array: [{
            //                   server_address_ip: "106.55.144.99",// ip
            //                   server_address_port: 80// 端口
            //             }],
            //             server_public_key: '0436ddd1de2ec99e57f8a796745bf5c639fe038d65f9df155e3cbc622d0b1b75a40ee49074920e56c6012f90c77be69f7f'// 公钥
            //           }
            //       }
            //   })
            //   console.log('私有化', privite)
            timRenderInstance.TIMInit().then(async ({ data }) => {
                if (data === 0) {
                    isInited = true;
                    console.log("初始化成功");
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
                                _onInvited(data)
                                break;
                            /**
                             * 自己的邀请被拒绝
                             */
                            case "TIMOnRejected":
                                _onRejected(data)
                                break;
                            /**
                             * 自己的邀请被接收
                             */
                            case "TIMOnAccepted":
                                _onAccepted(data)
                                break;
                            /**
                             * 收到的音视频邀请被取消
                             */
                            case "TIMOnCanceled":
                                _onCanceled(data)
                                break;
                            /**
                             * 收到的音视频邀请已經超时
                             */
                            case "TIMOnTimeout":
                                _onTimeout(data)
                                break;
                        }
                    });
                }
            });
        }
    };
    const _onInvited = (data)=>{

    }
    const _onRejected = (data)=>{
        
    }
    const _onAccepted = (data)=>{
        
    }
    const _onCanceled = (data)=>{
        
    }
    const _onTimeout = (data)=>{
        
    }
    const _handleElemUploadProgres = ({ message, index, cur_size, total_size, user_data }) => {
        const ramdon = Math.random()
        if (ramdon > 0.8) {
            dispatch(updateMessageElemProgress({
                messageId: message.message_msg_id,
                index,
                cur_size,
                total_size
            }));
        }
    }

    const _handleKickedout = async () => {
        dispatch(userLogout());
        history.replace("/login");
        dispatch(setIsLogInAction(false));
    };
    const _handleGroupInfoModify = async (data) => {
        const response = await getConversionList();
        dispatch(updateConversationList(response));
        if (response?.length) {
            const newConversaionItem = response.find(
                (v) => v.conv_id === data.group_tips_elem_group_id
            );
            if (newConversaionItem) {
                dispatch(updateCurrentSelectedConversation(newConversaionItem));
            }
        }
    };
    const handleMessageSendFailed = (convList) => {
        const failedList = convList.reduce((acc, cur) => {
            if (cur.conv_last_msg && cur?.conv_last_msg.message_status === 3) {
                return {
                    ...acc,
                    [cur.conv_id]: [...[acc[cur.conv_id]], cur.conv_last_msg].filter(
                        (x) => x
                    ),
                };
            }
        }, {});

        if (!failedList) return;

        for (const i in failedList) {
            dispatch(
                reciMessage({
                    convId: i,
                    messages: failedList[i],
                })
            );
        }
    };
    const _handleUnreadChange = (unreadCount) => {
        dispatch(setUnreadCount(unreadCount));
    };
    const _handeMessage = (messages: State.message[]) => {
        // 收到新消息，如果正在聊天，更新历史记录，并设置已读，其他情况没必要处理
        const obj = {};
        for (let i = 0; i < messages.length; i++) {
            if (!obj[messages[i].message_conv_id]) {
                obj[messages[i].message_conv_id] = [];
            }
            obj[messages[i].message_conv_id].push(messages[i]);
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
            handleMessageSendFailed(convList);
            if (conversationList[0]?.conv_last_msg?.message_status === 1) {
                dispatch(updateMessages({
                    convId: conversationList[0].conv_id,
                    message: conversationList[0].conv_last_msg
                }))
            }

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

    const _handleMessageReaded = (data) => {
        const c2cDdata = data.filter((item) => item.msg_receipt_conv_type === 1);
        const convIds = c2cDdata.map((item) => item.msg_receipt_conv_id);
        if (c2cDdata.length > 0) {
            dispatch(markConvLastMsgIsReaded(c2cDdata));
            dispatch(markMessageAsReaded({ convIds }));
        }
    };

    useEffect(() => {
        initIMSDK();
    }, []);
    return (
        <div id="app-container">
            <ToolsBar></ToolsBar>
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
