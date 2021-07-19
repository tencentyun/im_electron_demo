import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_USERID } from "../../constants";
import timRenderInstance from "../../utils/timRenderInstance";
import { setUserInfo } from '../../store/actions/user';
import { Avatar } from "../../components/avatar/avatar";
import { Bubble, Button } from "tea-component";
import { markMessageAsRead } from "../message/api";
export const Profile = (): JSX.Element => {
    const dispatch = useDispatch();
    const [sdkAppid] = useState(DEFAULT_USERID);
    const { faceUrl, nickName, userId } = useSelector((state: State.RootState) => state.userInfo);

    const getSelfInfo = async () => {
        const { data: { code, json_param } } = await timRenderInstance.TIMProfileGetUserProfileList({
            json_get_user_profile_list_param: {
                friendship_getprofilelist_param_identifier_array: [sdkAppid]
            },
        });
        if (code === 0) {
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
    useEffect(() => {
        getSelfInfo()
    }, [])

    const handleMsgReaded = async () => {
        const userInfo = useSelector((state: State.RootState) => state.userInfo);
        console.warn(userInfo,"用户信息")
        
        // try {
        //   const { code, ...res } = await markMessageAsRead(
        //     // conv_id,
        //     // conv_type,
        //     // message_msg_id
        //   );
        //   if (code === 0) {
        //     console.log("设置会话已读成功");
        //   } else {
        //     console.log("设置会话已读失败", code, res);
        //   }
      };
    return (
        <div className="userinfo-avatar">
            <Bubble
                placement={'right-start'}
                content={
                    <>
                       <Button type="primary" onClick={handleMsgReaded}>发消息</Button>
                    </>
                }
            >
                <Avatar
                    url={faceUrl}
                    nickName={nickName}
                    userID={userId}
                />
                {/* bubble组件必须包含一个有click之类事件的方法 */}
                <span></span>
            </Bubble>
        </div>
    )
}

