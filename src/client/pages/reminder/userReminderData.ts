import { useEffect, useState } from 'react';

import eventEmiter from './event';

export const useCallData = () => {
    const [data, setData] = useState({
        group_report_elem_group_id:"",
        group_report_elem_group_name:"",
        user_profile_identifier:"",
        user_profile_nick_name:""
    });

    useEffect(() => {
        eventEmiter.on('getReminderData', (data) => {
            const { group_report_elem_group_id, group_report_elem_group_name, user_profile_identifier, user_profile_nick_name } = data;
            setData({
                group_report_elem_group_id,
                group_report_elem_group_name,
                user_profile_identifier,
                user_profile_nick_name
            })
        });

        // eventEmiter.on('changeWindowType', type => {
        //     setData(data => ({
        //         ...data,
        //         windowType: type,
        //     }))
        // });

        // eventEmiter.on('updateInviteList', inviteList => {
        //     setData(prev => ({...prev, inviteList }))
        // });

        return () => {
            eventEmiter.off('getReminderData');
            // eventEmiter.off('changeWindowType');
            // eventEmiter.off('updateInviteList');
        }
    }, []);

    return data;
}