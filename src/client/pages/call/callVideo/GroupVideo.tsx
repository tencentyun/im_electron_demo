import React, { useEffect, useState } from 'react';
import {
    TRTCVideoFillMode,
    TRTCVideoRotation,
    TRTCRenderParams,
} from "trtc-electron-sdk/liteav/trtc_define";

import useDynamicRef from '../../../utils/react-use/useDynamicRef';
import event from '../event';
import useUserList from '../useUserList';
import GroupVideoItem from './GroupVideoItem';

export const GroupVideo = (props) => {
    const { trtcInstance, inviteList, userId, isVideoCall, inviteListWithInfo } = props;
    const [groupSplit, deleteUser, setUserEntering, setUserAudioAvailable, setUserSpeaking, setUserOrder] = useUserList(inviteList);
    const [currentPage, setCurrentPage] = useState(0);
    const [enteringUser, setEnteringUser] = useState('');
    const [setRef, getRef] = useDynamicRef<HTMLDivElement>();
    const shouldShowPrevButton = currentPage >= 1;
    const shouldShowNextButton = groupSplit.length > 1 && currentPage < groupSplit.length - 1;

    useEffect(() => {
        event.on('toggleVideo', onVideoChanged);
        event.on('toggleVoice', onVoiceChanged);
        trtcInstance.on('onEnterRoom', onEnterRoom);
        trtcInstance.on('onRemoteUserLeaveRoom', onRemoteUserLeaveRoom);
        trtcInstance.on('onRemoteUserEnterRoom', onRemoteUserEnterRoom);
        isVideoCall && trtcInstance.on('onUserVideoAvailable', onUserVideoAvailable);
        trtcInstance.on('onUserAudioAvailable', onUserAudioAvailable);
        trtcInstance.on('onUserVoiceVolume', onUserVoiceVolume);
    }, []);

    useEffect(() => {
        if (enteringUser) {
            const ref = getRef(enteringUser);
            if (enteringUser === userId) {
                trtcInstance.startLocalAudio();
                trtcInstance.enableAudioVolumeEvaluation(300);
                isVideoCall && openLocalVideo(ref);
                return;
            }
        }
    }, [enteringUser]);

    const onVideoChanged = (shouldShow) => {
        const selfViewRef = getRef(userId);
        selfViewRef.current.getElementsByTagName('canvas')[0].style.display = shouldShow ? 'block' : 'none';
    }

    const onVoiceChanged = (isAvailable) => setUserAudioAvailable(userId, isAvailable);

    const openLocalVideo = (selfViewRef) => {
        trtcInstance.startLocalPreview(selfViewRef.current);
        const params = new TRTCRenderParams(TRTCVideoRotation.TRTCVideoRotation0, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
        trtcInstance.setLocalRenderParams(params);
        trtcInstance.muteLocalVideo(false);
    };

    const onEnterRoom = (result) => {
        if (result > 0) {
            setUserOrder(userId, true); // 自己始终在第一位
            setUserEntering(userId);
            setEnteringUser(userId);
        };
    };

    const onRemoteUserEnterRoom = (userId) => {
        setUserEntering(userId);
        setEnteringUser(userId);
    }

    const onUserVoiceVolume = (params) => {
        const speakingList = params.map(item => {
            const speakingUid = item.userId === "" ? userId : item.userId;
            if(item.volume >= 5) {
                return speakingUid
            }
        });

        setUserSpeaking(speakingList);
    }

    const onRemoteUserLeaveRoom = (userId) => deleteUser(userId);

    const onUserVideoAvailable = (uid, available) => {
        const ref = getRef(uid);
        const isOpenCamera = available === 1;
        const isOpenStream = !!ref.current.getElementsByTagName('canvas')[0];
        if (isOpenCamera) {
            if(!isOpenStream) {
                trtcInstance.startRemoteView(uid, ref.current);
                trtcInstance.setRemoteViewFillMode(uid, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
            }
            ref.current.style.display = 'block';
        } else {
            ref.current.style.display = 'none';
        }

        setUserOrder(uid, isOpenCamera);
    }

    const onUserAudioAvailable = (uid, available) => setUserAudioAvailable(uid, available === 1);

    const cacluateStyle = () => {
        const haveMultiPage = groupSplit.length > 1;
        const count = groupSplit[currentPage]?.length;
        // const [width, height] = remote.getCurrentWindow().getSize();
        const width = 800;
        const height = 600;
        const footerHeight = 76;
        const statusBarHeight = 36;
        const callWindowInnerHeight = height - footerHeight - statusBarHeight;

        if(haveMultiPage) {
            return {
                width: width / 3,
                height: callWindowInnerHeight / 3
            }
        } 

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
                                item.map(({userId, isEntering, isMicOpen, isSpeaking, order}) => {
                                    const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = getUserInfo(userId);
                                    const displayName = user_profile_nick_name || user_profile_identifier;
                                    const hasFaceUrl = !user_profile_face_url;
                                    return <div key={userId} className={`group-video-content__page-item ${isSpeaking ? 'is-speaking' : ''}`} style={{...cacluateStyle(), backgroundImage: `url(${user_profile_face_url})`, order}}>
                                        <GroupVideoItem isMicAvailable={isMicOpen} isEntering={isEntering} setRef={setRef} userId={userId} userNickName={displayName} hasFaceUrl={hasFaceUrl} />
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