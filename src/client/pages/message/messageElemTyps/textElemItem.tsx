import React from "react";

export const TextElemItem = (props: any) : JSX.Element => {
    const item = ({ text_elem_content }) => <span className="message-view__item--text text right-menu-item">{text_elem_content}</span>;
    return (
        item(props)
    );
}