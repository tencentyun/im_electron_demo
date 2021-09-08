import React, { useEffect } from 'react';
import { useCallData } from './userReminderData';
import { ReminderCpontent } from './reminderCpntent/reminderCpntent'
export const Reminder = ()=>{
    const { group_report_elem_group_id, group_report_elem_group_name, user_profile_identifier, user_profile_nick_name } = useCallData();

    return(
        <div>
            {
                <ReminderCpontent 
                    group_report_elem_group_id={group_report_elem_group_id}
                    group_report_elem_group_name={group_report_elem_group_name}
                    user_profile_identifier={user_profile_identifier}
                    user_profile_nick_name={user_profile_nick_name}
                ></ReminderCpontent>
            }
        </div>
    )
}