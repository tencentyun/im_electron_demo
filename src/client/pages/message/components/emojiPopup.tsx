import { List } from "tea-component"
import React, { FC, useEffect, useRef, useState } from "react"
import timRenderInstance from "../../../utils/timRenderInstance"
import './emojiPopup.scss'
import { emojiMap, emojiName, emojiUrl } from '../emoji-map'

interface EmojiPopupProps {
    callback: Function
}

export const EmojiPopup: FC<EmojiPopupProps> = ({ callback }): JSX.Element => {
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
            callback("")
        } 
    }
    return (
        <div ref={refPopup} className="emoji-popup">
            {
                emojiName.map((v, i) => <span key={i} onClick={() => callback(v)}>
                    <img src={emojiUrl + emojiMap[v]} />
                </span>)
            }
        </div>
    )
}