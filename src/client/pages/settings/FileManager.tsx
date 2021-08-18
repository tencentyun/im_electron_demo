import React, { useState } from "react";
import {
  Button,
  Blank,
  Card,
  Layout,
  ExternalLink,
  Radio,
} from "tea-component";

const { Body, Content } = Layout;


export const FileManager = () =>{
    const [theme, setTheme] = useState("open");
    return  (<>
        <Layout>
          <Body>
            <Content>
              <Content.Header title="文件管理">
              </Content.Header>
              <Content.Body>
                <Card full>
                  <Blank
                    theme={theme}
                    description="专注于工作平台文件管理系统，后续将集成云文档功能，敬请期待！"
                  />
                </Card>
              </Content.Body>
            </Content>
          </Body>
        </Layout>
    </>)
}