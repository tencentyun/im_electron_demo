import React, { FC, useEffect, useState } from "react"
import { RouteComponentProps } from "react-router-dom"
import './avatar.scss'
import ImgViewer from '../../components/ImgViewer'


type AvatarSizeEnum = "default" | "large" | "small" | "mini"

interface AvatarProps  {
    size?: AvatarSizeEnum,
    url?: string,
    extralClass?: string,
    nickName?: string,
    userID?: string,
    groupID?: string,
}



export const Avatar:FC<AvatarProps> = ( { size='default',url:avatar,extralClass = '',nickName:nick,userID:uid,groupID:gid } ): JSX.Element => {
    const [nickName,setNickName] = useState(nick)
    const [url,setUrl] = useState(avatar)
    const [userID,setUserID] = useState(uid)
    const [groupID, setGroupID] = useState(gid)
    const [show, setShow] = useState(false)
    const [imgPreViewUrl,setImgPreViewUrl] = useState('')
    const displayInfo = (info:string)=>{
        if(!info){
            return "未知"
        }
        return info.slice(-2).toUpperCase()
    }
    const handleClose = () => {
        setShow(false)
    }
    const handleOpen = () => {
        setShow(true)
        setImgPreViewUrl(url)
    }
    const urlComp:JSX.Element =  <div className={`avatar ${size} ${extralClass}`} style={{
        backgroundImage:`url(${url})`,
    }}>
        
    </div>;
    const nickComp:JSX.Element = <div className={`avatar ${size} ${extralClass}`} >
        {
            displayInfo(nickName)
        }
    </div>;
    const userIDComp:JSX.Element = <div className={`avatar ${size} ${extralClass}`} >
        {
            displayInfo(userID)
        }
    </div>;
    const groupIDComp:JSX.Element = <div className={`avatar ${size} ${extralClass}`} >
        {
            displayInfo(groupID)
        }
    </div>;
    const defaltComp:JSX.Element = <div className={`avatar ${size} ${extralClass}`}>
        未知
    </div>;
    useEffect(()=>{
        setNickName(nick)
        setUrl(avatar)
        setUserID(uid)
        setGroupID(gid)
    },[avatar,nick,uid,gid])
    return (
        <>
            <ImgViewer show={show} onClose={handleClose} isCanOpenFileDir={false} url={imgPreViewUrl}></ImgViewer>
            <div onClick={handleOpen}>
                {
                url ? urlComp : nickName ? nickComp : userID ? userIDComp : groupID ? groupIDComp : defaltComp
                }
            </div>
           
            
    
        </>
    )
}