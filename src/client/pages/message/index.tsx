import React, { useState, useEffect} from 'react';
import { Avatar } from '../../components/avatar/avatar';

import { SearchBox } from '../../components/searchBox/SearchBox';
import { getConversionList } from './api';
import './message.scss';
import { MessageInfo } from './MessageInfo';

const defautUrl = "https://upload-dianshi-1255598498.file.myqcloud.com/sll-6f612b72f856eb5be01bce048f55032222d3d0f8.jpg";

export const Message = (): JSX.Element => {
    const [activeConvInfo, setActiveConvInfo ] = useState({
        convId: '',
        convType: 1,
        convProfile: {
            name: '',
            faceUrl: ''
        }
    });
    const [ conversionList, setConversionList ] = useState([]);
    console.log('conversionList', conversionList);

    useEffect(() => {
        const getData = async () => {
            const response = await getConversionList();
            setConversionList(response);
            const {conv_id, conv_type, conv_profile} = response[0];
            const defaultActiveInfo = {
                convId: conv_id,
                convType: conv_type,
                convProfile: {
                    name: conv_profile.user_profile_nick_name ?? conv_profile.group_detial_info_group_name,
                    faceUrl: conv_profile.user_profile_face_url ?? conv_profile.group_detial_info_face_url
                }
            }
            setActiveConvInfo(defaultActiveInfo);
        }
        getData();
    }, []);

    const handleConvListClick = convInfo => setActiveConvInfo(convInfo);

    const getLastMsgInfo = lastMsg => {
        const {message_elem_array,  message_is_read} = lastMsg;
        const firstMsg = message_elem_array[0];
        const displayLastMsg = {
            '0': firstMsg.text_elem_content,
            '1': '[图片]',
            '2': '[声音]',
            '3': '[自定义元素]',
            '4': '[文件元素]',
            '5': '[群组系统消息元素]',
            '6': '[表情元素]',
            '7': '[位置元素]',
            '8': '[群组系统通知元素]',
            '9': '[视频元素]',
            '10': '[关系]',
            '11': '[资料]',
            '12': '[合并消息元素]',
        }[firstMsg.elem_type];

        return <React.Fragment>
            <span className={`icon ${message_is_read ? 'is-read' : ''}` } />
            <span className="text">{displayLastMsg}</span>
        </React.Fragment>;
    }

    return (
        <div className="message-content">
            <div className="message-list">
                <SearchBox/>
                <div className="conversion-list">
                    {
                        conversionList.map(({conv_profile, conv_id, conv_type, conv_last_msg}) => {
                            const faceUrl = conv_profile.user_profile_face_url ?? conv_profile.group_detial_info_face_url;
                            const nickName = conv_profile.user_profile_nick_name ?? conv_profile.group_detial_info_group_name;
                            return (
                                <div className={`conversion-list__item ${conv_id === activeConvInfo.convId ? 'is-active' : ''}`} key={conv_id} onClick={() => handleConvListClick({
                                    convId: conv_id,
                                    convType: conv_type,
                                    convProfile: {
                                        faceUrl,
                                        name: nickName
                                    }
                                })}>
                                    <Avatar url={faceUrl || defautUrl}/>
                                    <div className="conversion-list__item--info">
                                        <div className="conversion-list__item--nick-name">{nickName || '默认昵称'}</div>
                                        <div className="conversion-list__item--last-message">{getLastMsgInfo(conv_last_msg)}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

            </div>
            <MessageInfo {...activeConvInfo} />
        </div>
    )
};