import React from "react";


export const GroupSysElm = (props: any): JSX.Element => {
    
    const item = (props) => {
        
        return (
                <div className="message-view__item--group-sys" >
                    {
                        JSON.stringify(props)
                    }
                </div>
        )
    };
   
    return item(props);
}