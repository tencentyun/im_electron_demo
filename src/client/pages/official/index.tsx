import React, { useState } from "react";
import "./index.scss";
import { Card, H3, Button } from "tea-component";
import loginBg from '../../assets/icon/login-bg.png';

export const OfficialComponent = (): JSX.Element => {
  const [isShowIframe, setIsShowIframe] = useState(false)
  return (
    <>
    {
      !isShowIframe?<div className="relationship">
      {/* 左边导航 */}
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
      {/* 右边内容 */}
      <div className="relationship-content">
        <div className="loading-container">
          {
            isShowIframe?<iframe src="http://oaim.uat.crbank.com.cn:30002"></iframe>: ''
          }
        </div>
      </div>
    </div>: <div className="wrap_iframe">
            {
              isShowIframe?<iframe src="http://oaim.uat.crbank.com.cn:30002"></iframe>: ''
            }
          </div>
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
