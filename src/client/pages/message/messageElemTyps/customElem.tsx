import React from "react";
import withMemo from "../../../utils/componentWithMemo";


const CustomElem = (props: any): JSX.Element => {

  const item = (props) => {
    const { message } = props;
    const { message_sender } = message;
    const { custom_elem_data } = message.message_elem_array[0];
    let data = custom_elem_data;
    try {
     data =  JSON.parse(custom_elem_data)
    }catch(err){
    }
    try {
      switch (data.businessID) {
        case "group_create":
          return (
            <>
              {data.opUser}
              {data.content}
            </>
          );
        case 1:
            // 信令
            // @ts-ignore
            const parsedData = JSON.parse(data.data);
            switch(data.actionType){
              case 1:
                return <span>{data.inviter}邀请{
                  data.inviteeList.map((item,index)=>{
                    return <span className="" key={index}>{item}{index===data.inviteeList.length-1 ? '' : '、'}</span>
                  })
                }通话</span>
              case 2:
                return <span>{data.inviter}取消了通话</span>
              case 3:
                return <span>{
                  message_sender
                }接受通话</span>
              case 4:
                return <span>{message_sender}拒绝了通话</span>
              case 5:
                return <span>{data.inviter}超时未接听</span>
              default:
                return <span>信令未解析</span>
            }
        default:
          return <>{JSON.stringify(props)}</>;
      }
    }catch(err){
      return <>{JSON.stringify(props)}</>;
    }
  };

  return (
    <div className="message-view__item--text text right-menu-item">
      {item(props)}
    </div>
  );
};
export default withMemo(CustomElem)
