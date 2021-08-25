import React, { useEffect, useState } from 'react';

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

    const addZeroForTime = time => {
        const stringTime = '00' + time;
        const length = stringTime.length;
        return  stringTime.substring(length - 2, length);
    }

    const formateTime = (time) => {
       const minutes = Math.floor(time / 60);
       const hour = Math.floor(minutes / 60);
       const seconds = time % 60;

       return `${prefix}${addZeroForTime(hour)} : ${addZeroForTime(minutes)} : ${addZeroForTime(seconds)}`;
    };

    return (
        <span>
             {isStart ? formateTime(callTime) : '正在响铃...'}
        </span>
    )
}