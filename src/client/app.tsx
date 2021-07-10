import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import {  Provider } from "react-redux";

import store from './store'

import { Login } from './pages/login';
import { Home } from './pages/home';
import './assets/_basic.scss';
import timRenderInstance from './utils/timRenderInstance';
import { ToolsBar } from './components/toolsBar/toolsBar';

import './app.scss'
import initListeners from './imLiseners';


const App = () => {
    const [isInited,setIsInited] = useState(false);


    const initIMSDK = () => {
        if(!isInited){
            timRenderInstance.TIMInit().then(({data})=>{
                if(data === 0){
                    setIsInited(true)
                    console.log("初始化成功")
                    initListeners(function(callback){
                        const { data,type } = callback;
                        console.info('======================== 接收到IM事件 start ==============================')
                        console.log("类型：", type)
                        console.log('数据：', data)
                        console.info('======================== 接收到IM事件 end ==============================')
                        switch (type) {
                            case "TIMAddRecvNewMsgCallback":
                                _handeMessage(data);
                                break;
                        }
                    });
                }
            })
        }
    }
    const _handeMessage = (messages:[]) => {

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
