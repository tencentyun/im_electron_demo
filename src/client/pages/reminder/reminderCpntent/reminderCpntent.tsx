import React, { useEffect } from 'react';
import { remote } from 'electron';
import event from '../event';
import './reminderCpntent.scss';
import isClosed from '../../../assets/icon/closed.png'
import plaintextMeth from '../../../assets/icon/tongzhi.png'
export const ReminderCpontent = (props) =>{
    const { group_report_elem_group_id, group_report_elem_group_name, user_profile_identifier, user_profile_nick_name } = props;
   
    let timer = setTimeout(() => {
        closeCallWIndow();
    }, 10 * 1000);

    const closeCallWIndow = () => {
        const win = remote.getCurrentWindow();
        win.hide();
        clearTimeout(timer);
    }

    useEffect(()=>{
        event.on('reminderExit',()=>{
            // 如果没有接通，走这个退出逻辑
            closeCallWIndow();
        });


        return () => {
            clearTimeout(timer);
            event.off('reminderExit');
        }
    },[])

    return(
        <div className="notification">
        <div className="notification__close"  onClick={()=>{closeCallWIndow() }}>
            <img src={isClosed} alt="" />
        </div>
        <div className="notification__title">
            <img src={plaintextMeth} className="notification__avatar"/>
            <span>群代办提醒</span>
        </div>
        <div>
            <span className="notification__title--nick-name">{user_profile_nick_name}</span>
            <span className="notification__title--text">申请加入</span>
            <span className="notification__title--nick-name notification__title--bule">{group_report_elem_group_name}</span><br></br>
        </div>
        {/* <div className="notification__btn">
            <div className="notification__btn--apply" onClick={()=>{}}></div>
            <div className="notification__btn--refuse" onClick={()=>{}}></div>
        </div> */}
    </div>
    )

}