import React from 'react';
import { EmptyResult } from './EmptyResult';
import { ResultItem } from './ResultItem';

import './contacter-result.scss';

export const GroupAllResult = (props) => {
    const { result, onClose } = props;

    const handleDirect = (profile) => {
       
    };

    return (
        <div className="contacter-result ">
            {
                result.length ?
                    <div className="customize-scroll-style">
                        {
                            result.map((item, index) => {
                                const { groupName,FaceUrl } = item;
                                return (
                                    <ResultItem
                                        key={index}
                                        faceUrl={FaceUrl}
                                        nickName={groupName}
                                        depName = { groupName }
                                        userID = { groupName }
                                        onClick={() => handleDirect(item.groupName)}
                                    />
                                )
                            }
                            )
                        }
                    </div>
                    :
                    <EmptyResult />
            }
        </div>
    )
}