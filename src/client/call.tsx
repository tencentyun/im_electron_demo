  
import React from 'react';
import ReactDOM from "react-dom";

import { eventListiner } from './pages/call/callIpc';
import { Call } from './pages/call';

eventListiner.init();

ReactDOM.render(<Call />, document.getElementById("root"));