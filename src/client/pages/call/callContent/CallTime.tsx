import React, { useEffect, useState } from 'react';
import { formateCallTime } from "../../../utils/timeFormat";

export const CallTime = ({isStart, prefix, setRealCallTime}) => {
    const [callTime, setCallTime] = useState(0);

    useEffect(() => {
        let timer;
        if(isStart) {
            timer = setInterval(() => {
                setCallTime(time => {
                    setRealCallTime(time + 1);
                    return time + 1;
                });
            }, 1000);
        }

        return () => {
            clearInterval(timer);
        }
    }, [isStart]);

    return (
        <span>
             {isStart ?  `${prefix}${formateCallTime(callTime)}` : '正在响铃...'}
        </span>
    )
}