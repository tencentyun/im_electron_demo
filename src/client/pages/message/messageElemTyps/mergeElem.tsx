import React, { useState, useEffect } from "react";
import { Avatar } from '../../../components/avatar/avatar';
import { Modal } from 'tea-component';
import formateTime from '../../../utils/timeFormat';
import { downloadMergedMsg } from '../api';
import { displayDiffMessage } from "../MessageView";
import withMemo from "../../../utils/componentWithMemo";
import { changeShowModal } from '../../../store/actions/ui';
import { useDispatch, useSelector } from 'react-redux';


const MergeElem = (props: any): JSX.Element => {
    const dispatch = useDispatch();
    const [ showModal, setShowModal ] = useState(window.localStorage.getItem('ShowModal')&&JSON.parse(window.localStorage.getItem('ShowModal'))[0] == '1' ? true:false);
    const [ mergedMsg, setMergedMsg ] = useState([]);
    const { showModalStatus } = useSelector(
        (state: State.RootState) => state.ui
    );
    const showMergeDitail = async () => {
        if (props.merge_elem_message_array) {
            setMergedMsg(props.merge_elem_message_array);
        } else {
            console.log(props, 'props')
            const { data: { code, json_params } } = await downloadMergedMsg(props.message);
            dispatch(changeShowModal({
                isShow:1,
                showArray:JSON.parse(json_params)
            }))
            console.log(showModalStatus)
            setMergedMsg(showModalStatus.showArray);
        }
        setShowModal(true);
    }

    const handleModalClose = () => {
        dispatch(changeShowModal({
            isShow:0,
            showArray:[]
        }))
        setShowModal(false);
    }

    
    useEffect(() => {
        console.log(showModalStatus)
        if(showModalStatus.isShow == 1){
            setMergedMsg(showModalStatus.showArray)
            console.log(mergedMsg)
        }
      }, [showModal])


    const item = (props) => {
        return (
            <div className="message-view__item--merge right-menu-item" style={{ height: 'auto' }} onClick={showMergeDitail} >
                {/* 标题 */}
                <div className="message-view__item--merge___title" >{props.merge_elem_title}</div>
                {/* 消息摘要 */}
                {
                    props.merge_elem_abstract_array && props.merge_elem_abstract_array.map((item, index) => {
                        return <div key={index} className="message-view__item--merge___abst">{item}</div>
                    })
                }
                <Modal
                    className="message-info-modal"
                    disableEscape
                    visible={
                        showModal
                    }
                    size="85%"
                    onClose={handleModalClose}
                >
                    <Modal.Body>
                        <div>
                            <header className="merge-mesage-header">{props.merge_elem_title}</header>
                            <div className="merge-message-content customize-scroll-style">
                                {
                                    mergedMsg.length > 0 && mergedMsg.reverse().map((item: State.message, index) => {
                                        const previousMessage = mergedMsg[index - 1];
                                        const previousMessageSender = previousMessage?.message_sender_profile?.user_profile_identifier;
                                        const { message_sender_profile, message_elem_array, message_client_time } = item;
                                        const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = message_sender_profile;
                                        const shouldShowAvatar = previousMessageSender !== user_profile_identifier;
                                        const displayText = `${user_profile_nick_name || user_profile_identifier} ${formateTime(message_client_time * 1000, true)}`;

                                        return (
                                            <div key={index} className="merge-message-item">
                                                <div className="message-view__item--avatar face-url">
                                                    {
                                                        shouldShowAvatar && <Avatar url={user_profile_face_url} size="small" key={ user_profile_face_url } nickName={user_profile_nick_name} userID={user_profile_identifier} />
                                                    }
                                                </div>
                                                <div className="merge-message-item__message">
                                                    {shouldShowAvatar && <span className="merge-message-item__nick-name">{displayText}</span>}
                                                    {
                                                        message_elem_array && message_elem_array.length && message_elem_array.map((elment, index) => {
                                                            console.log(displayDiffMessage(item, elment, index), 'elment=========================', elment)
                                                            return (
                                                                <div className="message-view__item--element" key={index} >
                                                                    {
                                                                        displayDiffMessage(item, elment, index)
                                                                    }
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>

                                            </ div>
                                        )

                                    })
                                }
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )
    };
    return item(props);
}

export default withMemo(MergeElem);