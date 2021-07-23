import React from "react";
import { decodeText } from "../../../utils/decodeText";

export const TextElemItem = (props: any) : JSX.Element => {
    const item = ({ text_elem_content }) => <span className="message-view__item--text text right-menu-item">{decodeText(text_elem_content).map((item,index)=>{
        // 处理特殊字符 格式化空格和换行
        const contentText = item?.text?.replaceAll(/\n/g,'<br/>').replaceAll(/ /g,'&nbsp')
        return <span key={index}>{
            item.name === 'text' ? <span dangerouslySetInnerHTML={{__html: contentText}}></span> : <img src={item.src} style={{
                width:30,
                height:30
            }}/>
        }</span> 
    })}</span>;
    return (
        item(props)
    );
}