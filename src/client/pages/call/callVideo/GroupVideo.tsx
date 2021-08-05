import React, { useEffect, useState } from 'react';

import useDynamicRef from '../../../utils/react-use/useDynamicRef';

function randomString(e) {  
  e = e || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  a = t.length,
  n = "";
  for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}


export const GroupVideo = (props) => {
    const { trtcInstance } = props;
    const [userList, setUserList ] = useState([]);
    const [enteringUser, setEnteringUser ] = useState('');
    const [setRef, getRef] = useDynamicRef<HTMLDivElement>();

    useEffect(() => {
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onRemoteUserLeaveRoom', onRemoteUserLeaveRoom);
        trtcInstance.on('onRemoteUserEnterRoom', onRemoteUserEnterRoom);
        trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
    }, []);

    useEffect(() => {
        if(enteringUser) {
            const ref = getRef(enteringUser);
            console.log('current ref', ref.current);
        }
    }, [userList]);

    const onEnterRoom = (result) => {
        if(result > 0) {
            setUserList(['self-view']);
            setEnteringUser('self-view');
            console.log('========enter room========', result);
        };
    };

    const renderItem = userId => {
        return <div ref={setRef(userId)}>{userId}</div>
    }

    const RenderItemWithMemo = React.memo(renderItem);
    

    const onRemoteUserEnterRoom = (userId) => {
        setUserList(prev => [...prev, userId]);
        setEnteringUser(userId);
    }

    const onRemoteUserLeaveRoom =(userId) => {

    }

    const onUserVideoAvailable =(uid, available) => {

    }
    
    return (
        <div className="group-video-content">
            <button onClick={() => onEnterRoom(222)}>add self enter room</button>
            <button onClick={() => onRemoteUserEnterRoom(randomString(6))}>remote user enter room</button>

            {
                userList.map(userId => {
                    return <div ref={setRef(userId)}>{userId}</div>
                })
            }
        </div>
    )
};