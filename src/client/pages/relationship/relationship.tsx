import React, { FC } from "react"
import { RouteComponentProps } from "react-router-dom"
import './relationship.scss'



export const RelationShip = (): JSX.Element => {
    return (
        <div className="relationship">
            <div className="relationship-nav"></div>
            <div className="relationship-content"></div>
        </div>
    )
}