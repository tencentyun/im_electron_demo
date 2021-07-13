import { List } from "@tencent/tea-component"
import React, { FC, useEffect, useState } from "react"
import timRenderInstance from "../../../utils/timRenderInstance"
import './atPopup.scss'
import { emojiMap, emojiName, emojiUrl } from '../emoji-map'

interface EmojiPopupProps {
    callback: Function
}

export const EmojiPopup: FC<EmojiPopupProps> = ({ callback }): JSX.Element => {
    return (
        <div>
            {
                emojiName.map((v, i) => <span onClick={() => callback(v)}>{emojiMap[v]}</span>)
            }
        </div>
    )
}