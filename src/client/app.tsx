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
import { Home } from './pages/Home';
import timRenderInstance from './utils/timRenderInstance';

timRenderInstance.TIMInit().then(({data})=>{
    if(data === 0){
        console.log("初始化成功")
    }
})

const App = () => (
    <Router>
        <Switch>
            <Route path='/home' component={Home} >
            </Route>
            <Route path='/' component={Login} />
        </Switch>
    </Router>
)

ReactDOM.render(<Provider store={store}>
    <App/>
</Provider>, document.getElementById('root'));
