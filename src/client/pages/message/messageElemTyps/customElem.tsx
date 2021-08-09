import React, { useEffect } from "react";
import { ImagePreview } from 'tea-component'
export const CustomElem = (props: any): JSX.Element => {
    
    const item = (props) => {
        const { custom_elem_data, custom_elem_desc } = props
        let data = custom_elem_data;
        try {
            data =  JSON.parse(custom_elem_data)
           }catch(err){
         }
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
                        return <span className="" key={index}>{item}</span>
                      })
                    }通话</span>
                  case 2:
                    return <span>{data.inviter}取消了通话</span>
                  case 3:
                    return <span>{parsedData.inviter}的接受通话</span>
                  case 4:
                    return <span>{parsedData.handleID}拒绝了通话</span>
                  case 5:
                    return <span>{parsedData.inviter}邀请超时</span>
                  default:
                    return <span>信令未解析</span>
                }
               default:
                  <div className="message-view__item--text text right-menu-item" >
                  {

                    custom_elem_data === 'CUST_EMOJI' ?
                       
                        <ImagePreview
                            previewSrc={custom_elem_desc}
                            previewTitle="预览"
                        >
                            {open => <a onClick={open}> <img src={custom_elem_desc} style={{ maxWidth: 178 }} /></a>}
                        </ImagePreview>
                        : JSON.stringify(props)
                    
                }
            </div>
          }
        };

        return (
                <div className="message-view__item--text text right-menu-item">
                    {item(props)}
                 </div>
        )
    };