import { Button, Icon, Input, List, Modal } from "@tencent/tea-component"
import { debounce } from 'lodash';
import React, { FC, useEffect, useRef, useState } from "react"
import timRenderInstance from "../../../utils/timRenderInstance"
import './forwardPopup.scss'
import { emojiMap, emojiName, emojiUrl } from '../emoji-map'
import { searchFriends, searchGroup } from "../api"
import { Avatar } from "../../../components/avatar/avatar";

interface ForwardPopupProps {
    callback: Function,
    conv_id: string,
    conv_type: number
}

export const ForwardPopup: FC<ForwardPopupProps> = ({ callback }): JSX.Element => {
    const refPopup = useRef(null)
    const [visible, setVisible] = useState(true)
    const [userList, setUserList] = useState([])
    const [groupList, setGroupList] = useState([])
    const [selectedList, setSelectedList] = useState([])
    const [search, setSearch] = useState("lexus")
    
    const getUserList = async () => {
        const userList = await searchFriends({ keyWords: search })
        setUserList(userList)
    }
    const getGroupList = async () => {
        const groupList = await searchGroup({ keyWords: search })
        setGroupList(groupList)
    }
    const setValue = (value) => {
        setSearch(value);
    }

    const handleInoputOnchange = debounce(setValue, 300);
    useEffect(() => {
        document.addEventListener('click', handlePopupClick);
        return () => {
            document.removeEventListener('click', handlePopupClick);
        }
    }, []);

    useEffect(() => {
        getUserList()
        setTimeout(() => {
            getGroupList()
        }, 0)   
    }, [search])

    const handlePopupClick = (e) => {
        if(!refPopup.current) return
        if (!refPopup.current.contains(e.target as Node) && refPopup.current !== e.target) {
            callback("")
        } 
    }
    const handleSelected = (id: string, bool?: boolean) => {
        if(bool === false || selectedList.includes(id)) {
            
            const list = selectedList.filter(v => v !== id)
            console.log(list)
            setSelectedList(list)
        } else {
            selectedList.push(id)
            console.log(selectedList)
            setSelectedList(selectedList)
        }
        // setTimeout(() => {
        //     console.log(selectedList)
        // }, 0)
    }
    return (
        <div ref={refPopup} >
            <Modal className="forward-popup" visible={visible} caption="转发" onClose={close}>
                <Modal.Body>
                    <div className="forward-popup__search-list">
                        <div className="forward-popup__search-list__search">
                        <Icon className="forward-popup__search-list__icon" type="search" />
                        <Input className="forward-popup__search-list__input" type="search" placeholder="查找好友、群" onChange={handleInoputOnchange}/>
                        </div>
                        <ul className="forward-popup__search-list__list">
                            { 
                                userList.map((v, k) =>
                                    <li  onClick={() => handleSelected(v.friend_profile_identifier || v.group_detial_info_group_id)} className="forward-popup__search-list__list__item" key={k}>
                                        { selectedList.includes(v.friend_profile_identifier || v.group_detial_info_group_id) && <Icon type="success" /> }
                                        { !selectedList.includes(v.friend_profile_identifier || v.group_detial_info_group_id) && <i className="forward-popup__search-list__list__item__icon-normal" ></i> }
                                        <Avatar
                                            size="mini"
                                            url={ v.friend_profile_user_profile.user_profile_face_url }
                                            nickName  = { v.friend_profile_user_profile.user_profile_nick_name || v.group_detial_info_group_id}
                                            userID = { v.friend_profile_identifier || v.group_detial_info_group_id }
                                        />
                                        <span>{selectedList.length}</span>
                                        <span className="forward-popup__search-list__list__item__name">user: {v.friend_profile_identifier}</span>
                                        { selectedList.includes(v.friend_profile_identifier || v.group_detial_info_group_id) && <Icon type="dismiss"  onClick={() => handleSelected(v.friend_profile_identifier, false)} /> }
                                    </li>
                                )
                            }
                            {
                                groupList.map((v, k) =>
                                    <li key={k}>group: {v.group_detial_info_group_id}</li>
                                )
                            }
                        </ul>
                    </div>
                    <div className="forward-popup__seleted-list">
                        {
                            selectedList.map((v, k) =>
                                <div key={k}>{v.friend_profile_identifier}</div>
                            )
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button type="primary" onClick={close}>
                    转发
                </Button>
                <Button type="weak" onClick={close}>
                    取消
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}