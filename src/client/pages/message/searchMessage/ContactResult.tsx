import React from 'react';
import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';
import { ResultItem } from './ResultItem';

import './contacter-result.scss';

export const ContactResult = (props) => {
    const { result, onClose } = props;
    const directToMsgPage = useMessageDirect();

    const handleDirect = (profile) => {
        directToMsgPage({
            profile,
            convType: 1,
            beforeDirect: onClose
        })
    };

    return (
        <div className="contacter-result ">
            {
                result.length ?
                    <div className="customize-scroll-style">
                        {
                            result.map((item, index) => {
                                const { user_profile_face_url, user_profile_nick_name } = item.conv_profile;
                                return (
                                    <ResultItem
                                        key={index}
                                        faceUrl={user_profile_face_url}
                                        nickName={user_profile_nick_name}
                                        onClick={() => handleDirect(item.conv_profile)}
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