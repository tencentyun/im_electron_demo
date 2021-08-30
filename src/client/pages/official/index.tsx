import React, { useState, FC, useEffect} from "react";
import "./index.scss";
import getHuaRunConfig from '../../constants/index'
import emil from '../../assets/icon/emil.png';
import { Tabs, Card } from 'antd';
const { TabPane } = Tabs;
interface UserItemProps{
  addTabs?:Function;
}


export const MokeDemo: FC<UserItemProps> = ({addTabs}): JSX.Element => {
  return(
          <div className="tabs-index-class-main">
          <Card  style={{ width: 300,cursor: "pointer" }}>
              <div className='class-mian' onClick={()=> addTabs()}>
                  <div>
                      <img className='class-img' src={emil}></img>
                  </div>
                  <div className='class-text'>
                        <div>邮箱</div>
                        <div className="class-emil">COREMAIL邮箱</div>
                  </div>
              </div>
          </Card>
      </div>
  )
}


export const Ifroms : FC<UserItemProps> = ({}) :JSX.Element => {
  return(
    <iframe  style={{width:'100%',height:'calc(100vh - 100px)'}} src="https://crmail.crc.com.cn/coremail/index.jsp"></iframe>
  )
}
let defaultActiveKey = "1"
export const OfficialComponent = (): JSX.Element => {
  const [panes, setPanes] = useState([])
  const [defaultActiveKey, setDefaultActiveKeys] = useState("1")
  const  addTabs = () => {
    setDefaultActiveKeys('2')
    setPanes([{title:"工作台",key:"1",closable:false,content:<MokeDemo addTabs={addTabs}></MokeDemo>},{title:"邮箱",key:"2",closable:true,content:<Ifroms></Ifroms>}] )
  }

  const  deletTabs = ()=> {
    setDefaultActiveKeys('1')
    setPanes([{title:"工作台",key:"1",closable:false,content:<MokeDemo addTabs={addTabs}></MokeDemo>}])
  }

  useEffect (()=>{
      setPanes([{title:"工作台",key:"1",closable:false,content:<MokeDemo addTabs={addTabs}></MokeDemo>}])
  },[])


  return (
    <>
    {
      <div  style={{padding:'10px'}}>
              <Tabs type="editable-card" activeKey={defaultActiveKey} hideAdd onEdit={deletTabs} onChange={(data)=>{setDefaultActiveKeys(data)}}>
                      {panes.map(pane => (
                        <TabPane tab={pane.title} key={pane.key}  closable={pane.closable}>
                            {pane.content}
                        </TabPane>
                      ))}
                  </Tabs>
      </div>
    //   !isShowIframe?<div className="relationship">
    //   {/* 左边导航 */}
    //   <div className="relationship-nav">
    //     <div className="example-stage">
    //       <Card style={{ maxWidth: 400, marginTop: 16 }}>
    //         <Card.Header>
    //           <div style={{display: 'flex',alignItems: 'center', marginLeft: '20px'}}>
    //           <div className="login-about__header--logo"></div>
    //         <H3>华润公众号</H3>
    //           </div>
    //         </Card.Header>
    //         <Card.Footer style={{ padding: "8px 20px" }}>
    //           <Button type="link" onClick={()=>{setIsShowIframe(true)}}>立即进入</Button>
    //         </Card.Footer>
    //       </Card>
    //     </div>
    //   </div>
    //   {/* 右边内容 */}
    //   <div className="relationship-content">
    //     <div className="loading-container">
    //       {
    //         isShowIframe?<iframe src={getHuaRunConfig.PUBBLIC_ACCOUNTS_URL}></iframe>: ''
    //       }
    //     </div>
    //   </div>
    // </div>: <div className="wrap_iframe">
    //         {
    //           isShowIframe?<iframe src={getHuaRunConfig.PUBBLIC_ACCOUNTS_URL}></iframe>: ''
    //         }
    //       </div>
    }
      {/* <div className="relationship">
        <div className="relationship-nav">
          <div className="example-stage">
            <Card style={{ maxWidth: 400, marginTop: 16 }}>
              <Card.Header>
                <div style={{display: 'flex',alignItems: 'center', marginLeft: '20px'}}>
                <div className="login-about__header--logo"></div>
              <H3>华润公众号</H3>
                </div>
              </Card.Header>
              <Card.Footer style={{ padding: "8px 20px" }}>
                <Button type="link" onClick={()=>{setIsShowIframe(true)}}>立即进入</Button>
              </Card.Footer>
            </Card>
          </div>
        </div>
        <div className="relationship-content">
          <div className="loading-container">
            {
              isShowIframe?<iframe src="http://localhost:8080/order"></iframe>: ''
            }
          </div>
        </div>
      </div> */}
    </>
  );
};
