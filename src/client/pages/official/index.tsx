import React, { useState } from "react";
import "./index.scss";
import getHuaRunConfig from '../../constants/index'
import emil from '../../assets/icon/emil.png';
import { Tabs, Card } from 'antd';
const { TabPane } = Tabs;
export const OfficialComponent = (): JSX.Element => {
  const [isShowIframe, setIsShowIframe] = useState(false)
  const  addTabs = () => {}
  return (
    <>
    {
      <Tabs type="card">
      <TabPane tab="工作台" key="1" >
        <div className="tabs-index-class-main">
            <Card  style={{ width: 300,cursor: "pointer" }}>
                <div className='class-mian' onClick={addTabs}>
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
      </TabPane>
      </Tabs>
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
