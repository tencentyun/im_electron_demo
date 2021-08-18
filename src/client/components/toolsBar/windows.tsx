import React from "react"
import { hideWin, maxSizeWin, minSizeWin } from "../../utils/tools";
import { Icon } from 'tea-component';
import './toolsbar.scss'
export const Windows = (): JSX.Element=>{

    return (
        <div className="windows">
            <Icon className="close-btn" type="close" onClick={ hideWin }/>
            <span className="max-size" onClick={ maxSizeWin }></span>
            <Icon className="min-size" type="minus" onClick={ minSizeWin } />
        </div>
    )
}