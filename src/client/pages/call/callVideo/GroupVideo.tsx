import React, { useEffect, useState } from 'react';
import {
    TRTCVideoFillMode,
    TRTCVideoRotation,
    TRTCRenderParams,
} from "trtc-electron-sdk/liteav/trtc_define";

import useDynamicRef from '../../../utils/react-use/useDynamicRef';
import event from '../event';
import { remote } from 'electron'
const splitUserList = (array, count) => {
    const catchArray = [];
    for (let i = 0; i < array.length; i += count) {
        catchArray.push(array.slice(i, i + count));
    }
    return catchArray;
};


export const GroupVideo = (props) => {
    const { trtcInstance, inviteList, userId, isVideoCall, inviteListWithInfo } = props;
    const [userList, setUserList] = useState(inviteList);
    const [groupSplit, setGroupSplit] = useState(splitUserList(inviteList, 9));
    const [currentPage, setCurrentPage] = useState(0);
    const [enteringUser, setEnteringUser] = useState('');
    const [setRef, getRef] = useDynamicRef<HTMLDivElement>();
    const shouldShowPrevButton = currentPage >= 1;
    const shouldShowNextButton = groupSplit.length > 1 && currentPage < groupSplit.length - 1;

    useEffect(() => {
        event.on('toggleVideo', onVideoChanged);
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onRemoteUserLeaveRoom', onRemoteUserLeaveRoom);
        trtcInstance.on('onRemoteUserEnterRoom', onRemoteUserEnterRoom);
        isVideoCall && trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
    }, []);

    useEffect(() => {
        setUserList(Array.from(new Set([userId, ...inviteList])));
    }, [inviteList])

    useEffect(() => {
        const resultArray = splitUserList(userList, 9);
        setGroupSplit(resultArray);
    }, [userList]);

    useEffect(() => {
        if (enteringUser) {
            const ref = getRef(enteringUser);
            if (enteringUser === userId) {
                trtcInstance.startLocalAudio();
                isVideoCall && openLocalVideo(ref);
                return;
            }
        }
    }, [enteringUser]);

    const onVideoChanged = (shouldShow) => {
        const selfViewRef = getRef(userId);
        selfViewRef.current.getElementsByTagName('canvas')[0].style.display = shouldShow ? 'block' : 'none';
    }

    const openLocalVideo = (selfViewRef) => {
        trtcInstance.startLocalPreview(selfViewRef.current);
        const params = new TRTCRenderParams(TRTCVideoRotation.TRTCVideoRotation0, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
        trtcInstance.setLocalRenderParams(params);
        trtcInstance.muteLocalVideo(false);
    };

    const onEnterRoom = (result) => {
        if (result > 0) {
            setUserList(prev => Array.from(new Set([userId, ...prev])));
            setEnteringUser(userId);
            if(!isVideoCall) {
                const ref = getRef(userId);
                ref.current.getElementsByTagName('span')[0].style.display = 'none';
            }
        };
    };

    const onRemoteUserEnterRoom = (userId) => {
        setUserList(prev => Array.from(new Set([...prev, userId])));
        setEnteringUser(userId);
        if(!isVideoCall) {
            const ref = getRef(userId);
            ref.current.getElementsByTagName('span')[0].style.display = 'none';
        }
    }

    const onRemoteUserLeaveRoom = (userId) => setUserList(prev => prev.filter(item => item !== userId));

    const onUserVideoAvailable = (uid, available) => {
        const ref = getRef(uid);
        if (available === 1) {
            trtcInstance.startRemoteView(uid, ref.current);
            trtcInstance.setRemoteViewFillMode(uid, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
            ref.current.style.display = 'block';
        } else {
            ref.current.style.display = 'none';
        }
    }

    const cacluateStyle = () => {
        const count = groupSplit[currentPage]?.length;
        // const [width, height] = remote.getCurrentWindow().getSize();
        const width = 800;
        const height = 600;
        const footerHeight = 76;
        const statusBarHeight = 36;
        const callWindowInnerHeight = height - footerHeight - statusBarHeight;
        if (count === 1) {
            return {
                width: width,
                height: callWindowInnerHeight
            }
        }

        if (count <= 2) {
            return {
                width: width / 2,
                height: callWindowInnerHeight
            }
        }

        if (count <= 4) {
            return {
                width: width / 2,
                height: callWindowInnerHeight / 2
            }
        }

        if (count <= 6) {
            return {
                width: width / 3,
                height: callWindowInnerHeight / 2
            }
        }

        return {
            width: width / 3,
            height: callWindowInnerHeight / 3
        }

    };

    const handlePagePrev = () => setCurrentPage(prev => prev - 1);

    const handlePageNext = () => setCurrentPage(next => next + 1);

    const cacluatePageStyle = (index) => ({ display: index === currentPage ? 'flex' : 'none' });

    const getUserInfo = (userId) : State.userProfile => inviteListWithInfo.find(item => item.user_profile_identifier === userId) || {};

    return (
        <>
            <div className="group-video-content">
                {
                    groupSplit.length > 0 && groupSplit.map((item, index) => {
                        return <div className="group-video-content__page" style={cacluatePageStyle(index)} key={index}>
                            {
                                item.map(userId => {
                                    const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = getUserInfo(userId);
                                    return <div key={userId} className="group-video-content__page-item" style={{...cacluateStyle(), backgroundImage: `url(${user_profile_face_url})`}}>
                                        <div ref={setRef(userId)} style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <span className="group-video-content__page-item--loading">正在等待对方接受邀请...</span>
                                            {
                                                !user_profile_face_url && <span>{user_profile_nick_name || user_profile_identifier}</span>
                                            }
                                        </div>
                                        <span className="group-video-content__page-item--user-id">{user_profile_nick_name || user_profile_identifier}</span>
                                    </div>
                                })
                            }
                        </div>
                    })
                }
                {
                    shouldShowPrevButton && <span className="prev-button" onClick={handlePagePrev} />
                }
                {
                    shouldShowNextButton && <span className="next-button" onClick={handlePageNext} />
                }
            </div>
        </>

    )
};