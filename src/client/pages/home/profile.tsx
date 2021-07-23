import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_USERID } from "../../constants";
import timRenderInstance from "../../utils/timRenderInstance";
import { setUserInfo } from '../../store/actions/user';
import { Avatar } from "../../components/avatar/avatar";
import { Popover, Button  } from "tea-component"
import { useMessageDirect } from "../../utils/react-use/useDirectMsgPage";
import { useLocation, useHistory } from 'react-router-dom';
import { changeFunctionTab } from '../../store/actions/ui';
import './profile.scss';
export const Profile = (): JSX.Element => {
    const dispatch = useDispatch();
    const [sdkAppid ] = useState(DEFAULT_USERID);
    const [visible, setVisible] = useState(false);
    const { pathname } = useLocation();
    const history = useHistory();
    const directToMsgPage = useMessageDirect();
    const { faceUrl,nickName,userId,gender,role } = useSelector((state: State.RootState) => state.userInfo);
    const fillStyle = { width: '100%' };
    let   [initData,setInitData] = useState({});
    const handleConvListClick = function(convInfo){
        console.log(convInfo)
        dispatch(changeFunctionTab('message'))
        directToMsgPage({
            convType: 1,
            profile:convInfo,
        });
        setVisible(false)
        // !pathname.includes('/home/message') && history.replace('/home/message');
    } 
    const getSelfInfo = async ()=>{
        const {data: {code, json_param}} = await timRenderInstance.TIMProfileGetUserProfileList({
            json_get_user_profile_list_param: {
                friendship_getprofilelist_param_identifier_array: [sdkAppid]
            },
        });
        if(code === 0){
            const {
                user_profile_role: role, 
                user_profile_face_url: faceUrl, 
                user_profile_gender:gender,
                user_profile_nick_name: nickName, 
                user_profile_identifier: userId
            } = JSON.parse(json_param)[0];
            setInitData(JSON.parse(json_param)[0])
            dispatch(setUserInfo({
                userId,
                faceUrl,
                nickName,
                role,
                gender
            }));
        }
    }
    useEffect(()=>{
        getSelfInfo()
    },[])
    
    const genderMast  = (data)=>{
        console.log(data)
        switch (data) {
            case 0:
                return '男'
            case 1:
                return '女'
            default:
                return '暂无'
        }
    }
    return (
        <Popover 
            trigger="click" 
            placement='right'
            // visible={visible}
            overlay={
                <div className='card-content'>
				<div className='main-info'>
                    <Avatar
                        url={ faceUrl }
                        nickName  = { nickName}
                        userID = { userId }
                    />
					<div className="nickname">
						{userId}
					</div>
				</div>
				<div className='info-bar'>
					<span className='info-key'>姓名</span><span className='info-val nickname'>{userId}</span>
				</div>
				<div className='info-bar'>
					<span className='info-key'>性别</span><span className='info-val'>{genderMast(gender)}</span>
				</div>
				<div className='info-bar'>
					<span className='info-key'>角色</span><span className='info-val'>{role}</span>
				</div>
				<div className='info-bar'>
                <Button type="primary" onClick={() => handleConvListClick(initData)} style={fillStyle}>
                    发消息
                </Button>
				</div>
			</div>
              }
        >
            <div className="userinfo-avatar"  onClick= {()=>{setVisible(true)}}>
                    <Avatar
                        url={ faceUrl }
                        nickName  = { nickName}
                        userID = { userId }
                    />
            </div>  
        </Popover> 
    )
}

