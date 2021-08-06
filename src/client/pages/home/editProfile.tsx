import React, { useEffect, useRef } from "react"
import { useSelector } from "react-redux";
import { Button, Icon } from "tea-component"
import { Avatar } from "../../components/avatar/avatar"

type Props = {
    callback:Function
}
export const EditProfile = (props:Props): JSX.Element => {
    const { userId, faceUrl,nickName,role, } = useSelector((state: State.RootState) => state.userInfo);
    const { callback } = props;
    const refPopup = useRef(null)
    const handleMsgReaded = () => { }
    const handleAvatarClick = () => { }
    useEffect(() => {
        document.addEventListener('click', handlePopupClick);
        return () => {
            document.removeEventListener('click', handlePopupClick);
        }
    }, []);

    const handlePopupClick = (e) => {
        if(!refPopup.current) return
        if (!refPopup.current.contains(e.target as Node) && refPopup.current !== e.target) {
            callback()
        } 
    }
    return <div className="userinfo-avatar--panel" ref={refPopup}>
        <div className="card-content">
            <div className="main-info">
                <div className="info-item">
                    <Avatar nickName={nickName} userID={userId} url={faceUrl} />
                    <div className="nickname">{nickName || '未设置'}</div>
                </div>
                {/* <div className="info-btn" onClick={handleAvatarClick}><Icon type="setting" /></div> */}
            </div>
            <div className="info-bar">
                <span className="info-key">ID</span>
                <span className="info-val nickname">{userId}</span>
            </div>
            <div className="info-bar">
                <span className="info-key">昵称</span>
                <span className="info-val">{nickName}</span>
            </div>
            <div className="info-bar">
                <span className="info-key">角色</span>
                <span className="info-val">{role}</span>
            </div>
            <div className="info-bar">
                <Button
                    type="primary"
                    onClick={() => handleMsgReaded()}
                    style={{ width: '100%' }}
                >
                    发消息
                </Button>
            </div>
        </div>
    </div>
}