import React, { FC } from "react"
import { RouteComponentProps } from "react-router-dom"
import './avatar.scss'


type AvatarSizeEnum = "default" | "large" | "small"

interface AvatarProps  {
    size?: AvatarSizeEnum,
    url: string,
    extralClass?: string
}



export const Avatar:FC<AvatarProps> = ( { size='default',url,extralClass } ): JSX.Element => {
    return (
        <div className={`avatar ${size} ${extralClass}`} style={{
            backgroundImage:`url(${url})`,
        }}>
            
        </div>
    )
}