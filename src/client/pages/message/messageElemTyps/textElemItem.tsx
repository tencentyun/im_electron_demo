import React from "react";
import { decodeText } from "../../../utils/decodeText";

export const TextElemItem = (props: any) : JSX.Element => {
    const item = ({ text_elem_content }) => <span className="message-view__item--text text right-menu-item">{decodeText(text_elem_content).map((item,index)=>{
        return <span key={index}>{
            item.name === 'text' ? <span >{item.text}</span> : <img src={item.src} style={{
                width:30,
                height:30
            }}/>
        }</span> 
    })}</span>;
    return (
        item(props)
    );
}