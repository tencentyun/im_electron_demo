import React, { useEffect } from "react";

export const CustomElem = (props: any): JSX.Element => {
    
    const item = (props) => {
        
        return (
            <div className="message-view__item--text text right-menu-item" >
                {
                    JSON.stringify(props)
                }
            </div>
        )
    };
   
    return item(props);
}