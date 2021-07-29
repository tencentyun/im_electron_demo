import React from 'react';
import ReactDOM from "react-dom";

import { eventListiner } from './pages/call/callIpc';
import { CallContent } from './pages/call';

eventListiner.init();

ReactDOM.render(
    <CallContent />,
    document.getElementById("root")
  );