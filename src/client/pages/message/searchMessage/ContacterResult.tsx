import React from 'react';
import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';
import { ResultItem } from './ResultItem';

import './contacter-result.scss';

export const ContacterResult = (props) => {
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
                                const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = item?.friendship_friend_info_get_result_field_info.friend_profile_user_profile;
                                return (
                                    <ResultItem
                                        key={index}
                                        faceUrl={user_profile_face_url}
                                        nickName={user_profile_nick_name || user_profile_identifier}
                                        onClick={() => handleDirect(item?.friendship_friend_info_get_result_field_info.friend_profile_user_profile)}
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