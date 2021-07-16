import { List } from "@tencent/tea-component"
import React, { FC, useEffect, useRef, useState } from "react"
import { Avatar } from "../../../components/avatar/avatar"
import timRenderInstance from "../../../utils/timRenderInstance"
import './atPopup.scss'

interface AtPopupProps {
    callback: Function,
    group_id: string
}

export const AtPopup: FC<AtPopupProps> = ({ callback, group_id }): JSX.Element => {
    const [list, setList] = useState([])
    const refPopup = useRef(null)

    const getList = async () => {
        const { data: { code, json_param } } = await timRenderInstance.TIMGroupGetMemberInfoList({
            params: {
                group_get_members_info_list_param_group_id: group_id
            },
            data: "test data",
        });
        if (code === 0) { 
            const list = JSON.parse(json_param).group_get_memeber_info_list_result_info_array
            setList(list)
        }
    }
    useEffect(() => {
        getList()
    }, [group_id])

    useEffect(() => {
        document.addEventListener('click', handlePopupClick);
        return () => {
            document.removeEventListener('click', handlePopupClick);
        }
    }, []);

    const handlePopupClick = (e) => {
        if(!refPopup.current) return
        if (!refPopup.current.contains(e.target as Node) && refPopup.current !== e.target) {
            callback("")
        } 
    }

    return (
        <div>
            <List ref={refPopup} className="at-popup">
                {
                    list.map((v, i) => 
                        <List.Item key={i} onClick={() => callback(v.group_member_info_identifier)}>    
                            <Avatar
                                size="mini"
                                userID = { v.group_member_info_identifier }
                            />
                            {v.group_member_info_identifier}
                        </List.Item>
                    )
                }
            </List>
        </div>
    )
}