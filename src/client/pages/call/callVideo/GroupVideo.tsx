import React, { useEffect, useState } from 'react';
import {
    TRTCVideoFillMode,
    TRTCVideoRotation,
    TRTCRenderParams,
    TRTCAppScene,
    TRTCParams,
} from "trtc-electron-sdk/liteav/trtc_define";

import useDynamicRef from '../../../utils/react-use/useDynamicRef';

function randomString(e) {  
  e = e || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  a = t.length,
  n = "";
  for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

const splitUserList = (array, count) => {
    const catchArray = [];
    for(let i=0; i<array.length; i+=count){
        catchArray.push(array.slice(i,i+count));
    }
    return catchArray;
};


export const GroupVideo = (props) => {
    const { trtcInstance } = props;
    const [userList, setUserList ] = useState([]);
    const [groupSplit, setGroupSplit ] = useState([]);
    const [currentPage, setCurrentPage ] = useState(0);
    const [enteringUser, setEnteringUser ] = useState('');
    const [setRef, getRef] = useDynamicRef<HTMLDivElement>();
    const shouldShowPrevButton = currentPage >= 1;
    const shouldShowNextButton = groupSplit.length > 1 && currentPage < groupSplit.length - 1;

    useEffect(() => {
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onRemoteUserLeaveRoom', onRemoteUserLeaveRoom);
        trtcInstance.on('onRemoteUserEnterRoom', onRemoteUserEnterRoom);
        trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
    }, []);

    useEffect(() => {
        const resultArray = splitUserList(userList, 9);
        setGroupSplit(resultArray);
    }, [userList]);

    useEffect(() => {
        let timeout;
        if(enteringUser) {
            // timeout = setTimeout(() => {
                const ref = getRef(enteringUser);
                if(enteringUser === 'self-view') {
                    // openLocalVideo(ref);
                    console.log('current ref', ref.current);
                    return;
                }
            // }, 0);
        }

        return () => {
            timeout && clearTimeout(timeout);
        }
    }, [enteringUser]);

    const openLocalVideo = (selfViewRef) => {
        trtcInstance.startLocalPreview(selfViewRef.current);
        trtcInstance.startLocalAudio();
        const params = new TRTCRenderParams(TRTCVideoRotation.TRTCVideoRotation0, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
        trtcInstance.setLocalRenderParams(params);
        trtcInstance.muteLocalVideo(false);
    };

    const onEnterRoom = (result) => {
        if(result > 0) {
            setUserList(['self-view']);
            setEnteringUser('self-view');
        };
    };

    const onRemoteUserEnterRoom = (userId) => {
        setUserList(prev => [...prev, userId]);
        setEnteringUser(userId);
    }

    const onRemoteUserLeaveRoom =(userId) => {
        setUserList(prev => prev.filter(item => item !== userId));
    }

    const onUserVideoAvailable =(uid, available) => {
        const ref = getRef(uid);
        if(available === 1) {
            trtcInstance.startRemoteView(uid, ref.current);
            trtcInstance.setRemoteViewFillMode(uid, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
        } else {
            console.log('remote-ref', ref);
        }
    }

    const cacluateStyle = () => {
        const count = groupSplit[currentPage]?.length;

        if(count === 1) {
            return {
                width: '100%',
                height: '99%'
            }  
        }

        if (count <= 2) {
            return {
                width: '50%',
                height: '99%'
            }
        }

        if (count <=  4 ) {
            return {
                width: '50%',
                height: '50%'
            }
        }

        if (count <= 6) {
            return {
                width: '33%',
                height: '50%'
            }
        }

        return {
            width: '33%',
            height: '33%'
        }

    };

    const handlePagePrev = () => {
        setCurrentPage(prev => prev -1);
    }

    const handlePageNext = () => {
        setCurrentPage(next => next + 1);
    }

    const cacluatePageStyle = (index) => {
        return {
            display: index === currentPage ? 'block' : 'none'
        }
    }
    
    return (
        <>
        <button onClick={() => onEnterRoom(222)}>add self enter room</button>
        <button onClick={() => onRemoteUserEnterRoom(randomString(6))}>remote user enter room</button>
        <div className="group-video-content">
            {
                groupSplit.length > 0  && groupSplit.map((item, index) => {
                    return <div className="group-video-content__page" style={cacluatePageStyle(index)}>
                        {
                             item.map(userId => {
                                return <div key={userId} className="group-video-content__page-item" style={cacluateStyle()} ref={setRef(userId)}><span>{userId}</span></div>
                            })
                        }
                    </div>
                })
            }
            {
                shouldShowPrevButton && <span className="prev-button" onClick={handlePagePrev}>{'<' }</span>
            }
            {
                shouldShowNextButton && <span className="next-button" onClick={handlePageNext}>{'>' }</span>
            }
        </div>
        </>

    )
};