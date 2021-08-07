import React, { useState } from 'react';
import GroupVideoItem from './GroupVideoItem';

const GroupVideoPage = (props) => {
    const { groupVideo } = props;
    const [currentPage, setCurrentPage ] = useState(0);

    const cacluateStyle = () => {
        const count = groupVideo[currentPage]?.length;

        if (count <= 2) {
            return {
                flex: 1
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

    return (
        <>
            {
                groupVideo.length > 0 && groupVideo.map(item => (
                    <div className="group-video-content__page">
                        <GroupVideoItem videoItem={item} style={cacluateStyle()} />
                    </div>
                ))
            }
        </>
    )
};

export default GroupVideoPage;