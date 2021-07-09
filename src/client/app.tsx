import React from 'react';
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
let inited = false

// 热更新导致每次都初始化，所以这里做下处理，在生产环境也是没问题的

if(!inited){
    timRenderInstance.TIMInit().then(({data})=>{
        if(data === 0){
            inited = true;
            console.log("初始化成功")
            initListeners(function(callback){
                const { data,type } = callback;
                console.log(data , type)
            });
        }
    })
}

const App = () => (
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

ReactDOM.render(<Provider store={store}>
    <App/>
</Provider>, document.getElementById('root'));
