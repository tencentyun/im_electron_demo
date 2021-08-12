import React from 'react';

type Props = {
    userNickName: string;
    setRef: (userId) => React.RefObject<HTMLDivElement>;
    hasFaceUrl: boolean;
    userId: string
}

const GroupVideoItem = (props: Props) => {
    const {setRef, hasFaceUrl, userNickName, userId } = props;
    console.log('=========render group video item==========');
    return (
        <React.Fragment>
            <div ref={setRef(userId)} style={{ position: 'relative', width: '100%', height: '100%' }}>
                <span className="group-video-content__page-item--loading">正在等待对方接受邀请...</span>
                {
                    !hasFaceUrl && <span>{userNickName}</span>
                }
            </div>
            <span className="group-video-content__page-item--user-id">{userNickName}</span>
        </React.Fragment>
    )
}

export default GroupVideoItem