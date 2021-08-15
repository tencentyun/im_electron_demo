import React, { FC, useEffect, useState } from "react"
import { RouteComponentProps } from "react-router-dom"
import './avatar.scss'
import { useDispatch } from 'react-redux';
import { setImgViewerAction } from '../../store/actions/imgViewer';
import { previewVvatar } from '../../utils/tools'

type AvatarSizeEnum = "default" | "large" | "small" | "mini"

interface AvatarProps {
    size?: AvatarSizeEnum,
    url?: string,
    isClick?: boolean,
    isPreview?: boolean,
    extralClass?: string,
    nickName?: string,
    userID?: string,
    groupID?: string,
}



export const Avatar: FC<AvatarProps> = ({ size = 'default', url: avatar, extralClass = '', isClick = true, isPreview = false, nickName: nick, userID: uid, groupID: gid }): JSX.Element => {
    const [nickName, setNickName] = useState(nick)
    const [url, setUrl] = useState(avatar)
    const [userID, setUserID] = useState(uid)
    const [groupID, setGroupID] = useState(gid)
    const dispatch = useDispatch();
    const displayInfo = (info:string)=>{
        if(!info){
            return "未知S"
        }
        return info.slice(-2).toUpperCase()
    }

    const handleOpen = () => {
        console.log(previewVvatar(url, 200))
        if (!url) return
        dispatch(setImgViewerAction({
            isShow: true,
            imgs: previewVvatar(url, 200),
            isCanOpenFileDir: false,
            index: 0
        }))
    }
    const urlComp: JSX.Element = <div className={`avatar ${size} ${extralClass}`} style={{
        backgroundImage: `url(${url})`,
    }}>

    </div>;
    const nickComp: JSX.Element = <div className={`avatar ${size} ${extralClass}`} >
        {
            displayInfo(nickName)
        }
    </div>;
    const userIDComp: JSX.Element = <div className={`avatar ${size} ${extralClass}`} >
        {
            displayInfo(userID)
        }
    </div>;
    const groupIDComp: JSX.Element = <div className={`avatar ${size} ${extralClass}`} >
        {
            displayInfo(groupID)
        }
    </div>;
    const defaltComp: JSX.Element = <div className={`avatar ${size} ${extralClass}`}>
        未知
    </div>;

    useEffect(() => {
        setNickName(nick)
        avatar && (!isPreview && !avatar.match(/imageView/) && !avatar.match(/gif/) ? setUrl(previewVvatar(avatar)) : setUrl(avatar))
        setUserID(uid)
        setGroupID(gid)
    }, [avatar, nick, uid, gid])

    return (
        <>
            <div onClick={isClick ? handleOpen : () => { }}>
                {
                    url ? urlComp : nickName ? nickComp : userID ? userIDComp : groupID ? groupIDComp : defaltComp
                }
            </div>



        </>
    )
}