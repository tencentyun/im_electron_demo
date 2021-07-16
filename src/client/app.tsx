import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import {  Provider, useDispatch, useSelector } from "react-redux";

import store from './store'

import { Login } from './pages/login';
import { Home } from './pages/home';
import './assets/_basic.scss';
import timRenderInstance from './utils/timRenderInstance';
import { ToolsBar } from './components/toolsBar/toolsBar';

import './app.scss'
import initListeners from './imLiseners';
import { setUnreadCount, updateConversationList, markConvLastMsgIsReaded } from './store/actions/conversation';
import { addProfileForConversition } from './pages/message/api';
import { reciMessage, markeMessageAsRevoke, markMessageAsReaded } from './store/actions/message';
// eslint-disable-next-line import/no-unresolved
let isInited = false

const App = () => {
    const dispatch = useDispatch()


    const { currentSelectedConversation } = useSelector((state: State.RootState) => state.conversation);

    const { function_tab } = useSelector((state: State.RootState) => state.ui);

    const initIMSDK = () => {
        if(!isInited){
            timRenderInstance.TIMInit().then(({data})=>{
                if(data === 0){
                    isInited = true
                    console.log("初始化成功")
                    initListeners.bind(this)((callback) => {
                        const { data,type } = callback;
                        console.info('======================== 接收到IM事件 start ==============================')
                        console.log("类型：", type)
                        console.log('数据：', data)
                        console.info('======================== 接收到IM事件 end ==============================')
                        console.log(currentSelectedConversation)
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
                        }
                    });
                }
            })
        }
    }
    const _handleUnreadChange = (unreadCount)=>{
        dispatch(setUnreadCount(unreadCount))
    }
    const _handeMessage = (messages:State.message[]) => {
        // 收到新消息，如果正在聊天，更新历史记录，并设置已读，其他情况没必要处理
        const obj = {};
        for(let i  = 0;i<messages.length;i++){
            if(!obj[messages[i].message_conv_id]){
                obj[messages[i].message_conv_id] = []
            }
            obj[messages[i].message_conv_id].push(messages[i])
        }
        for(let i in obj){
            dispatch(reciMessage({
                convId: i,
                messages: obj[i]
            }))
        }
        
    }
    const _handleConversaion = (conv) => {
        const { type, data} = conv;
        switch(type){
            /**
             * 新增会话
             */
            case 0:
                console.log('新增会话')
                break;
            /**
             * 删除会话
             */
            case 1:
                console.log('删除会话')
                break;
            /**
             * 会话同步完成
             */
            case 2:
                console.log('同步会话完成')
                _updateConversation(data)
                break;
            /**
             * 会话开始同步
             */
            case 3:
                console.log('开始同步会话')
                break;
            /**
             * 会话更新
             */
            case 4:
                console.log('会话更新')
                break;
        }
    }
    const _updateConversation =async (conversationList:Array<State.conversationItem>)=>{
        if(conversationList.length){
            const convList = await addProfileForConversition(conversationList);
            dispatch(updateConversationList(convList))
        }
    }

    const _handleMessageRevoked = (data) => {
        data.forEach(item => {
            const { message_locator_conv_id: convId,  message_locator_unique_id: messageId} = item;
            dispatch(markeMessageAsRevoke({
                convId,
                messageId
            }))
        });
    }

    const _handleMessageReaded = (data) => {
        const c2cDdata = data.filter(item => item.msg_receipt_conv_type === 1);
        const convIds = c2cDdata.map(item => item.msg_receipt_conv_id);
        if(c2cDdata.length > 0) {
            dispatch(markConvLastMsgIsReaded(c2cDdata));
            dispatch(markMessageAsReaded({convIds}));
        }
    }

    useEffect(()=>{
        initIMSDK()
    },[])
    return (
        <div id="app-container">
            <ToolsBar></ToolsBar>
            <Router>
                <Switch>
                    <Route path='/home' component={Home} >
                    </Route>
                    <Route path='/' component={Login} />
                </Switch>
            </Router>
        </div>
    )
}

ReactDOM.render(<Provider store={store}>
    <App/>
</Provider>, document.getElementById('root'));
