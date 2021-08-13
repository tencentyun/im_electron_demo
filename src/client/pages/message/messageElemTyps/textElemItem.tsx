import React from "react";
import { isEqual } from "lodash";
import { decodeText } from "../../../utils/decodeText";
import withMemo from "../../../utils/componentWithMemo";

const TextElemItem = (props: any) : JSX.Element => {
    const formatText = (content) => {
        //发啥就是哈
        let textHtml = <span style={{ whiteSpace: 'pre-wrap' }} >{content?.text}</span>
        return textHtml
    }
    const item = ({ text_elem_content }) => <span className="message-view__item--text text right-menu-item">{decodeText(text_elem_content).map((item,index)=>{
        return <span key={index}>{
            item.name === 'text' ? <span>{formatText(item)}</span> : <img src={item.src} style={{
                width: 30,
                height: 30
            }} />
        }</span>
    })}</span>;
    return (
        item(props)
    );
}

export default withMemo(TextElemItem)