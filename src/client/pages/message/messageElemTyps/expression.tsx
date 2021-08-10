import React from "react";
import { useState } from "react";

export const Expression = (props: any): JSX.Element => {
    console.log(props)
    const item = (props) => {
        return (
                <div className="message-view__item--voice" >
                    <img src={props.face_elem_buf} alt="" style={{ width:'100px',height:'100px' }}/>
                </div>
        )
    };
   
    return item(props);
}