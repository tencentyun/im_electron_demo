import React from 'react';

export const MessageResult = (props) => {
    const { result: { msg_search_result_total_count, msg_search_result_item_array } } = props;
    return (
        <div className="message-result customize-scroll-style">
            message result
            {/* {
                msg_search_result_total_count > 0 && msg_search_result_item_array.map(item => {
                    const { msg_search_result_item_message_array } = item; 


                })
            } */}
        </div>
    )
}