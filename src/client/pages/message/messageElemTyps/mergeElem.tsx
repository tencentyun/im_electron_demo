import React, { useState } from "react";
import { Avatar } from '../../../components/avatar/avatar';
import { Modal } from 'tea-component';

import { displayDiffMessage } from "../MessageView";

export const MergeElem = (props: any): JSX.Element => {
    const [showModal, setShowModal ] = useState(false);
    const showMergeDitail = () => { 
        // setShowModal(true);
     }

     const handleModalClose = () => {
         setShowModal(false);
     }
    const item = (props) => {

        return (
            <div className="message-view__item--merge right-menu-item" onClick={showMergeDitail} >
                {/* 标题 */}
                <div className="message-view__item--merge___title" >{props.merge_elem_title}</div>
                {/* 消息摘要 */}
                {
                    props.merge_elem_abstract_array.map((item, index) => {
                        return <div key={index} className="message-view__item--merge___abst">{item}</div>
                    })

                }
                <Modal 
                    className="message-info-modal" 
                    disableEscape 
                    visible={showModal} 
                    size="85%"
                    onClose={handleModalClose}
                >
                    <Modal.Body>
                        <div>
                            <header>{props.merge_elem_title}</header>
                            <div>
                                {
                                    props.merge_elem_message_array && props.merge_elem_message_array.map((item: State.message,index) => {
                                        const { message_sender_profile, message_elem_array } = item;
                                        const { user_profile_face_url, user_profile_nick_name, user_profile_identifier } = message_sender_profile;

                                        return (
                                            <div key={index}>
                                                <div className="message-view__item--avatar face-url">
                                                    <Avatar url={user_profile_face_url} size="small" nickName={user_profile_nick_name} userID={user_profile_identifier} />
                                                </div>
                                                {
                                                message_elem_array && message_elem_array.length && message_elem_array.map((elment, index) => {
                                                    return (
                                                        <div className="message-view__item--element" key={index} >
                                                            {
                                                                displayDiffMessage(item, elment, index)
                                                            }
                                                        </div>
                                                        )
                                                    })
                                                }
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
    console.log('合并消息', props)
    return item(props);
}