import React, { useState } from 'react';
import { remote } from 'electron';

import './call-content.scss';

export const CallContent = () => {
    const callingTIme = '00:37';
    const [noVideo] = useState(true);

    const handleClose = () => {
        const env = process.env.NODE_ENV;
        const win = remote.getCurrentWindow();
        win.close();
    };
     
    return <div className="call-content">
       <header className="call-content__header">
           <span>通话时间: {callingTIme}</span>
       </header>
       <section className="call-content__video">
           {
               noVideo && <div className="call-content__video--empty" />
           }
       </section>
       <footer className="call-content__footer">
           <div className="call-content__footer-btn--control">
               <span className="voice"></span>
               <span className="video"></span>
           </div>
           <div className="call-content__footer-btn--end">
               <button onClick={handleClose}>挂断</button>
           </div>
       </footer>
    </div>
};