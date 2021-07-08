import React from "react"
import { closeWin, maxSizeWin, minSizeWin } from "../../utils/tools"
import './toolsBar.scss'
export const Windows = (): JSX.Element=>{

    return (
        <div className="windows">
            <span className="min-size" onClick={ minSizeWin }>最小化</span>
            <span className="max-size" onClick={ maxSizeWin }>最大化</span>
            <span className="close" onClick={ closeWin }>关闭</span>
        </div>
    )
}