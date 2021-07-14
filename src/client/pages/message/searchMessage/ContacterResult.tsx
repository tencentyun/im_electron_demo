import React from 'react';
import { Avatar } from '../../../components/avatar/avatar';
import { EmptyResult } from './EmptyResult';
import { useMessageDirect } from '../../../utils/react-use/useDirectMsgPage';

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
        <div className="contacter-result customize-scroll-style">
            {
                result.length ? result.map((item, index) => {
                        const { user_profile_face_url,  user_profile_nick_name } = item.friend_profile_user_profile;
                        return (
                            <div className="contacter-result__item" key={index} onClick={() => handleDirect(item.friend_profile_user_profile)}>
                                <Avatar url={user_profile_face_url} />
                                <span className="contacter-result__item--nick-name">{user_profile_nick_name}</span>
                            </div>
                        )
                    }
                ) :
                <EmptyResult />
            }
        </div>
    )
}