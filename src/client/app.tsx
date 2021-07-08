import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import {  Provider } from "react-redux";

import store from './store'

import { Login } from './pages/Login';
import { Home } from './pages/home/Home';
import timRenderInstance from './utils/timRenderInstance';
import { ToolsBar } from './components/toolsBar/toolsBar';

import './app.scss'

timRenderInstance.TIMInit().then(({data})=>{
    if(data === 0){
        console.log("初始化成功")
    }
})

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
