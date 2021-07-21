import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_USERID } from "../../constants";
import timRenderInstance from "../../utils/timRenderInstance";
import { setUserInfo } from "../../store/actions/user";
import { Avatar } from "../../components/avatar/avatar";
import { Bubble, Button } from "tea-component";
import { useMessageDirect } from "../../utils/react-use/useDirectMsgPage";
import "./profile.scss";
export const Profile = (): JSX.Element => {
  const dispatch = useDispatch();
  const [sdkAppid] = useState(DEFAULT_USERID);
  const { faceUrl, nickName, userId, gender, role } = useSelector(
    (state: State.RootState) => state.userInfo
  );
  const fillStyle = { width: "100%" };
  const [initData, setInitData] = useState({});

  const getSelfInfo = async () => {
    const {
      data: { code, json_param },
    } = await timRenderInstance.TIMProfileGetUserProfileList({
      json_get_user_profile_list_param: {
        friendship_getprofilelist_param_identifier_array: [sdkAppid],
      },
    });
    if (code === 0) {
      const {
        user_profile_role: role,
        user_profile_face_url: faceUrl,
        user_profile_gender: gender,
        user_profile_nick_name: nickName,
        user_profile_identifier: userId,
      } = JSON.parse(json_param)[0];
      setInitData(JSON.parse(json_param)[0]);
      dispatch(
        setUserInfo({
          userId,
          faceUrl,
          nickName,
          role,
          gender,
        })
      );
    }
  };
  useEffect(() => {
    getSelfInfo();
  }, []);

  const directToMsgPage = useMessageDirect();

  const handleMsgReaded = async () => {
    const {
      data: { json_param },
    } = await timRenderInstance.TIMProfileGetUserProfileList({
      json_get_user_profile_list_param: {
        friendship_getprofilelist_param_identifier_array: [sdkAppid],
      },
    });
    directToMsgPage({
      convType: 1,
      profile: JSON.parse(json_param)[0],
    });
  };
  const genderMast = (data) => {
    console.log(data);
    switch (data) {
      case 0:
        return "男";
      case 1:
        return "女";
      default:
        return "暂无";
    }
  };
  return (
    <Bubble
      placement={"right-start"}
      content={
        <>
          <div className="card-content">
            <div className="main-info">
              <Avatar url={faceUrl} nickName={nickName} userID={userId} />
              <div className="nickname">{userId}</div>
            </div>
            <div className="info-bar">
              <span className="info-key">姓名</span>
              <span className="info-val nickname">{userId}</span>
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
                onClick={() => handleMsgReaded(initData)}
                style={fillStyle}
              >
                发消息
              </Button>
            </div>
          </div>
        </>
      }
    >
      <Avatar url={faceUrl} nickName={nickName} userID={userId} />
      {/* bubble组件必须包含一个有click之类事件的方法的元素 */}
      <span></span>
    </Bubble>
  );
};
