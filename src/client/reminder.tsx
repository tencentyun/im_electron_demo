
import React from 'react';
import ReactDOM from "react-dom";

import { eventListiner } from './pages/reminder/reminderIpc';
import { Reminder } from './pages/reminder';

eventListiner.init(); //注册监听事件 与主进程通信

ReactDOM.render(<Reminder />, document.getElementById("root"));