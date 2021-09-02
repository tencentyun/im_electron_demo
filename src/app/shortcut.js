const { globalShortcut, clipboard, app, ipcMain } = require("electron");
const child_process = require("child_process");
const downloadUrl = app.getPath("downloads");
const fs = require("fs");
const path = require("path");
let isScreen = true;

const _cut = (appWindow) => {
  if (isScreen) {
    isScreen = false;
    const url = `${downloadUrl}\\${new Date().getTime()}-screenShot.png`;
    child_process.exec(
        path.join(process.cwd(), "/resources/extraResources", "cut.exe"),
        () => {
        let pngs = clipboard.readImage().toPNG();
        fs.writeFile(url, pngs, (err) => {
          fs.readFile(url, (err, data) => {
            console.log(data, "data............");
            try {
              appWindow.webContents.send("screenShotUrl", {
                data,
                url,
              });
              isScreen = true;
            } catch (err) {
              console.log("screenShotUrl error", err);
              isScreen = true;
            }
          });
        });
      }
    );
  }
};
// 注册截图快捷键
const registerCut = (appWindow) => {
  globalShortcut.register("CommandOrControl+Shift+X", () => {
    clipboard.clear();
    _cut(appWindow);
  });
  // 接受截图事件
  ipcMain.on("SCREENSHOT", function () {
    //news 是自定义的命令 ，只要与页面发过来的命令名字统一就可以
    //接收到消息后的执行程序
    // path.join(process.cwd(), "/resources/extraResources", "cut.exe")
    _cut(appWindow);
  });
};
module.exports = registerCut;
