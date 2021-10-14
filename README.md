# IM Electron Demo
IM(Instant Messaging) Electron Demo 包含了即时通信(IM)和实时音视频(TRTC)的能力，简单接入、稳定必达，通过腾讯云服务向开发者开放，致力于帮助开发者快速搭建低成本、可靠的、高品质的通信解决方案。产品参考: [即时通信(IM)](https://cloud.tencent.com/product/im)

## 如何启动项目
```
// install package
npm install

cd src/client
npm install

// run 
npm run start
```
## 如何打包
```
// 打包mac app
npm run build:mac

// 打包windows app
npm run build:windows
```

## 常见问题
- 1: 安装开发环境问题，`gypgyp ERR!ERR`, 参考[](https://stackoverflow.com/questions/57879150/how-can-i-solve-error-gypgyp-errerr-find-vsfind-vs-msvs-version-not-set-from-c).
- 2: Mac 端执行`npm run start` 会出现白屏，原因是渲染进程的代码还没有build完成，主进程打开的3000端口为空页面，当渲染进程代码build 完成重新刷新窗口后即可解决问题。或者执行`cd src/client && npm run dev:react`, `npm run dev:electron`, 分开启动渲染进程和主进程。

## 文档链接
- [IM Electron SDK 文档](https://testcomm.qq.com/toc-electron-sdk-doc/index.html)
- [TRTC Electron SDK 文档](https://web.sdk.qcloud.com/trtc/electron/doc/zh-cn/trtc_electron_sdk/index.html)
