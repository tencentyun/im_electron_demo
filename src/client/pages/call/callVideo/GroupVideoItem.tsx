import React from 'react';

const GroupVideoItem = (props) => {
    const { videoItem, style } = props;
    return (
        <>
            {
                videoItem.map(userId => <div key={userId} style={style} className="group-video-content__page-item" >{userId}</div>)
            }
        </>
    )
};

export default React.memo(GroupVideoItem);