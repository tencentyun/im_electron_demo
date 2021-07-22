import React from "react";

export const MergeElem = (props: any): JSX.Element => {
    const showMergeDitail = () => { }
    const item = (props) => {

        return (
            <div className="message-view__item--merge right-menu-item" onClick={showMergeDitail} >
                {/* 标题 */}
                <div className="message-view__item--merge___title" >{props.merge_elem_title}</div>
                {/* 消息摘要 */}
                {
                    props.merge_elem_abstract_array.map((item, index) => {
                        return <div key={index} className="message-view__item--merge___abst">{item}</div>
                    })

                }
            </div>
        )
    };
    // console.log('合并我笑傲你', props)
    return item(props);
}