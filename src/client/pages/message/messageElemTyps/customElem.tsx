import React, { useEffect } from "react";
export const CustomElem = (props: any): JSX.Element => {
    
    const item = (props) => {
        const { custom_elem_data, custom_elem_desc } = props
        return (
            <div className="message-view__item--text text right-menu-item" >
                {

                    custom_elem_data === 'CUST_EMOJI' ?
                        <img src={custom_elem_desc} style={{ maxWidth: 178 }} />
                        : JSON.stringify(props)
                    
                }
            </div>
        )
    };
   
    return item(props);
}