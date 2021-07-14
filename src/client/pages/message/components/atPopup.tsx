import { List } from "@tencent/tea-component"
import React, { FC, useEffect, useState } from "react"
import timRenderInstance from "../../../utils/timRenderInstance"
import './atPopup.scss'

interface AtPopupProps {
    callback: Function,
    group_id: string
}

export const AtPopup: FC<AtPopupProps> = ({ callback, group_id }): JSX.Element => {
    const [list, setList] = useState([])

    const getList = async ()=>{
        const {data: { code, json_params }} = await timRenderInstance.TIMProfileGetUserProfileList({
            params: {
                group_get_members_info_list_param_group_id: group_id,
                msg_getmsglist_param_count: 100,
            },
            data: "test",
        });
        if(code === 0){
            const list = JSON.parse(json_params)
            setList(list)
        }
    }
    useEffect(() => {
        getList()
    },[])

    return (
        <div>
            <List className="at-popup" split="divide">
                {
                    list.map((v, i) => <List.Item onClick={() => callback(v)}>v.name</List.Item>)
                } 
            </List>
        </div>
    )
}