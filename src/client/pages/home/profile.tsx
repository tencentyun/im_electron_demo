import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_USERID } from "../../constants";
import timRenderInstance from "../../utils/timRenderInstance";
import { setUserInfo } from '../../store/actions/user';
import { Avatar } from "../../components/avatar/avatar";
import { UserInfo } from "../../components/EditUserInfo";
import { Bubble, Button } from "tea-component";
import { useMessageDirect } from '../../utils/react-use/useDirectMsgPage';


export const Profile = (): JSX.Element => {
    const dispatch = useDispatch();
    const [userVisible,setUserVisible] = useState(false)
    const [sdkAppid] = useState(DEFAULT_USERID);
    const { faceUrl,nickName,userId } = useSelector((state: State.RootState) => state.userInfo);
    const getSelfInfo = async ()=>{
        const {data: {code, json_param}} = await timRenderInstance.TIMProfileGetUserProfileList({
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
    const handleAvatarClick = () => {
        setUserVisible(true)
    }
    const handleChange = (val) => {
        console.log('val',val);
    }
     const handleClose = (val) => {
          setUserVisible(val)
    }
    useEffect(()=>{
        getSelfInfo()
    }, [])

    const directToMsgPage = useMessageDirect();

    const handleMsgReaded = async () => {
        const { data: { json_param } } = await timRenderInstance.TIMProfileGetUserProfileList({
            json_get_user_profile_list_param: {
                friendship_getprofilelist_param_identifier_array: [sdkAppid]
            },
        });
        directToMsgPage({
            convType: 1,
            profile : JSON.parse(json_param)[0],
        })
      };
    return (
        <div className="userinfo-avatar" onClick={handleAvatarClick}>
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
                {/* bubble组件必须包含一个有click之类事件的方法的元素 */}
                <span></span>
            </Bubble>
            <UserInfo userInfo={{faceUrl,nickName,userId}} visible={userVisible}  onClose={handleClose} onChange={handleChange}></UserInfo>

        </div>
    )
}

