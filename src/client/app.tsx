import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import {  Provider, useDispatch } from "react-redux";

import store from './store'

import { Login } from './pages/login';
import { Home } from './pages/home';
import './assets/_basic.scss';
import timRenderInstance from './utils/timRenderInstance';
import { ToolsBar } from './components/toolsBar/toolsBar';

import './app.scss'
import initListeners from './imLiseners';
import { updateConversationList } from './store/actions/conversation';
import { addProfileForConversition } from './pages/message/api';
// eslint-disable-next-line import/no-unresolved
let isInited = false

const App = () => {
    const dispatch = useDispatch()


    const initIMSDK = () => {
        if(!isInited){
            timRenderInstance.TIMInit().then(({data})=>{
                if(data === 0){
                    isInited = true
                    console.log("初始化成功")
                    initListeners((callback) => {
                        const { data,type } = callback;
                        console.info('======================== 接收到IM事件 start ==============================')
                        console.log("类型：", type)
                        console.log('数据：', data)
                        console.info('======================== 接收到IM事件 end ==============================')
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
                        }
                    });
                }
            })
        }
    }
    const _handeMessage = (messages:[]) => {
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
            console.log(convList)
            dispatch(updateConversationList(convList))
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
