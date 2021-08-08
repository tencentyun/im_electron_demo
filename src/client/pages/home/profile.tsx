import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import timRenderInstance from "../../utils/timRenderInstance";
import { setUserInfo } from "../../store/actions/user";
import { Avatar } from "../../components/avatar/avatar";
import { UserInfo } from "../../components/EditUserInfo";
import { Bubble, Button, Icon } from "tea-component";
import { useMessageDirect } from '../../utils/react-use/useDirectMsgPage';
import { useHistory } from "react-router-dom";
import { EditProfile } from "./editProfile";
import "./profile.scss";


export const Profile = (): JSX.Element => {
  const dispatch = useDispatch();
  const [userVisible, setUserVisible] = useState(false)
  const uId = localStorage.getItem('uid');
  const history = useHistory()
  // eslint-disable-next-line prefer-const
  let { faceUrl, nickName, userId, gender, role } = useSelector((state: State.RootState) => state.userInfo);
  const fillStyle = { width: "100%" };
  const [initData, setInitData] = useState({});

  const getSelfInfo = async () => {
// 处理后端返回的文件路径，目前的所存储的文件路径不是直接返回一个可访问的资源，是一个base64字符 // todo 待优化

    const { data: { code, json_param } } = await timRenderInstance.TIMProfileGetUserProfileList({
      json_get_user_profile_list_param: {
        friendship_getprofilelist_param_identifier_array: [uId]
      },
    });

  
    if (code === 0) {
      const {
        user_profile_role: role,
        user_profile_face_url: faceUrl,
        user_profile_nick_name: nickName,
        user_profile_identifier: userId,
        user_profile_gender: gender
      } = JSON.parse(json_param)[0];
      setInitData(JSON.parse(json_param)[0]);
      dispatch(setUserInfo({
        userId,
        faceUrl,
        nickName,
        role,
        gender
      }));
    }
  }
  useEffect(() => {
    getSelfInfo();
  }, []);
  console.log('useSelector((state: State.RootState) => state.userInfo)', useSelector((state: State.RootState) => state.userInfo));
  const directToMsgPage = useMessageDirect();

  const handleMsgReaded = async () => {
    const {
      data: { json_param },
    } = await timRenderInstance.TIMProfileGetUserProfileList({
      json_get_user_profile_list_param: {
        friendship_getprofilelist_param_identifier_array: [uId],
      },
    });
    directToMsgPage({
      convType: 1,
      profile: JSON.parse(json_param)[0],
    });
  };


  const handleAvatarClick = () => {
    setUserVisible(true)
  }
  const handleClose = (val) => {
    setUserVisible(val)
  }
  const genderMast = (data) => {
    console.log(data);
    switch (data) {
      case 1:
        return "男";
      case 2:
        return "女";
      default:
        return "暂无";
    }
  };
  return (
    <div>
      <Bubble
        trigger="click"
        placement={"right-start"}
        content={
          <>
            <div className="card-content">
              <div className="main-info">
                <div className="info-item">
                  <Avatar url={faceUrl} isPreview={true} nickName={nickName} userID={userId} />
                  <div className="nickname">{nickName}</div>
                </div>
                <div className="info-btn" onClick={handleAvatarClick}><Icon type="setting" /></div>
              </div>
              <div className="info-bar">
                <span className="info-key">姓名</span>
                <span className="info-val nickname">{nickName}</span>
              </div>
              <div className="info-bar">
                <span className="info-key">性别</span>
                <span className="info-val">{genderMast(gender)}</span>
              </div>
              <div className="info-bar">
                <span className="info-key">角色</span>
                <span className="info-val">{role}</span>
              </div>
              <div className="info-bar">
                <Button
                  type="primary"
                  onClick={() => handleMsgReaded()}
                  style={fillStyle}
                >
                  发消息
                </Button>
              </div>
            </div>
          </>
        }
      >
        <Avatar url={faceUrl} nickName={nickName} isClick={false} userID={userId} />
        {/* bubble组件必须包含一个有click之类事件的方法的元素 */}
        <span></span>
      </Bubble>

      <UserInfo onUpdateUserInfo={getSelfInfo} userInfo={{ faceUrl, nickName, userId, gender }} visible={userVisible} onClose={handleClose}></UserInfo>
    </div>

  );
};
