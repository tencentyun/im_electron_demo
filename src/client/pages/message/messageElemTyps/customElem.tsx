import React, { useState } from "react";
import withMemo from "../../../utils/componentWithMemo";
import { formateCallTime } from "../../../utils/timeFormat";
import './public-message.scss';
import { Modal } from 'tea-component';

const CustomElem = (props: any): JSX.Element => {
  const [ showModal, setShowModal ] = useState(false)
  const [ modalMessage, setModalMessage ] = useState({})
  const item = (props) => {
    const { message } = props;
    const { message_sender } = message;
    const { custom_elem_data,custom_elem_ext,custom_elem_desc } = message.message_elem_array[0];
    let data = custom_elem_data;
    try {
     data =  JSON.parse(custom_elem_data)
    }catch(err){
    }
    try {
      if(data === 'group_create'){
        return (
          <>
            {custom_elem_ext}
          </>
        );
      }
      //解析公众号推送
      else if (custom_elem_desc == '公众号推送') {
        return (
          <>
            <div>
              <div className="public-message" onClick={()=>{
                setShowModal(true)
                setModalMessage(data.Content)
                }}>
                <div className="public-message__img"><img src={data.Img}/></div>
                <div className="public-message__text">{data.Desc}</div>
              </div>
                <Modal
                    className="message-info-modal"
                    disableEscape
                    visible={
                      showModal
                    }
                    size="85%"
                    onClose={()=>{setShowModal(false)}}
                >
                  <Modal.Body>
                    <div>
                      <header className="merge-mesage-header">公众号文章</header>
                      <div dangerouslySetInnerHTML={{__html:modalMessage.toString()}}></div>
                    </div>
                  </Modal.Body>
                </Modal>
              </div>
          </>
        );
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
            const parsedData = JSON.parse(data.data||JSON.stringify({}));
            switch(data.actionType){
              case 1:
                const { call_end } = parsedData;
                if(call_end>=0){
                  return <span>通话结束，通话时长{formateCallTime(call_end)}s</span>
                }
                return <span>{data.inviter}邀请{
                  data.inviteeList.map((item,index)=>{
                    return <span className="" key={index}>{item}{index===data.inviteeList.length-1 ? '' : '、'}</span>
                  })
                }通话</span>
              case 2:
                return <span>{data.inviter}取消了通话</span>
              case 3:
                return <span>{
                  data.inviteeList.map((item,index)=>{
                    return <span className="" key={index}>{item}{index===data.inviteeList.length-1 ? '' : '、'}</span>
                  })
                }接受通话</span>
              case 4:
                return <span>{data.inviteeList.map((item,index)=>{
                  return <span className="" key={index}>{item}{index===data.inviteeList.length-1 ? '' : '、'}</span>
                })}拒绝了通话</span>
              case 5:
                console.log(data)
                return <span>{
                  data.inviteeList.map((item,index)=>{
                    return <span className="" key={index}>{item}{index===data.inviteeList.length-1 ? '' : '、'}</span>
                  })}超时未接听</span>
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

export default withMemo(CustomElem);
