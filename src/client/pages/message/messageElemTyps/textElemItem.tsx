import React from "react";
import { decodeText } from "../../../utils/decodeText";

const formatText = (data) => {
    console.warn(data?.text)
   return data?.text?.replace(/<img /g,'xxxxx')
   .replace(/ >/g,'YYYYY')
   .replaceAll(/ /g,'&nbsp')
   .replace(/<\/?.+?\/?>/g,'')
   .replaceAll(/\n/g,'<br/>')
   .replace(/xxxxx/g,'<img ')
   .replace(/YYYYY/g,' >')
}

export const TextElemItem = (props: any) : JSX.Element => {
    const item = ({ text_elem_content }) => <span className="message-view__item--text text right-menu-item">{decodeText(text_elem_content).map((item,index)=>{
        // 处理特殊字符 格式化空格和换行
        return <span key={index}>{
            item.name === 'text' ? <span dangerouslySetInnerHTML={{__html: formatText(item)}}></span> : <img src={item.src} style={{
                width:30,
                height:30
            }}/>
        }</span> 
    })}</span>;
    return (
        item(props)
    );
}