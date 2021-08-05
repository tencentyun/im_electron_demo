import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import timRenderInstance from "../../utils/timRenderInstance";
import { setUserInfo } from '../../store/actions/user';
import { Avatar } from "../../components/avatar/avatar";
export const Profile = (): JSX.Element => {
    const dispatch = useDispatch();
    const { faceUrl,nickName,userId } = useSelector((state: State.RootState) => state.userInfo);
    const getSelfInfo = async ()=>{
        const {data: {code, json_param}} = await timRenderInstance.TIMProfileGetUserProfileList({
            json_get_user_profile_list_param: {
                friendship_getprofilelist_param_identifier_array: [userId]
            },
        });
        console.log(json_param,'2321')
        if(code === 0){
            const {
                user_profile_role: role, 
                user_profile_face_url: faceUrl, 
                user_profile_nick_name: nickName, 
                user_profile_identifier: userId
            } = JSON.parse(json_param)[0];
            dispatch(setUserInfo({
                userId,
                faceUrl,
                nickName,
                role
            }));
        }
    }
    useEffect(()=>{
        console.log('获取个人信息')
        getSelfInfo()
    },[])

    return (
        <div className="userinfo-avatar">
            <Avatar
                url={ faceUrl }
                nickName  = { nickName}
                userID = { userId }
            />
        </div>
    )
}

