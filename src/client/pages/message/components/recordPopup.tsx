import { List, Button } from "@tencent/tea-component"
import React, { FC, useEffect, useRef, useState } from "react"
import timRenderInstance from "../../../utils/timRenderInstance"
import './recordPopup.scss'

interface RecordPopupProps {
    onSend: Function
    onCancel: Function
}

export const RecordPopup: FC<RecordPopupProps> = ({ onSend, onCancel }): JSX.Element => {
    const refPopup = useRef(null)
    
    useEffect(() => {
        document.addEventListener('click', handlePopupClick);
        return () => {
            document.removeEventListener('click', handlePopupClick);
        }
    }, []);

    const handlePopupClick = (e) => {
        if(!refPopup.current) return
        if (!refPopup.current.contains(e.target as Node) && refPopup.current !== e.target) {
            onCancel()
        } 
    }
    return (
        <div ref={refPopup} className="record-popup">
            <div className="record-popup__icon"></div>
            <div  className="record-popup__tips">正在录音</div>
            <Button type="primary" onClick={() => onSend("path")} className="record-popup__btn-send">发送</Button>
            <Button onClick={() => onCancel()} className="record-popup__btn-cancel">取消</Button>
        </div>
    )
}