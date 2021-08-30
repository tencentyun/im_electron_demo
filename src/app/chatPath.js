const { ipcMain, dialog, ipcRenderer } = require("electron");
const { SETTING_FILES_ITEM } = require("./const/const");
const Store = require("electron-store");
const fs = require("fs");
const path = require("path");
const store = new Store();
const selectChatPath = (mainWindow) => {
  ipcMain.on("chatpath", function (event, data) {
    dialog
      .showOpenDialog({
        title: "选择存放文件",
        buttonLabel: "确定",
        properties: ["openDirectory", "createDirectory"],
      })
      .then((saveTo) => {
        const setting = {
          chatpath: saveTo.filePaths[0],
          selectpath: store.get("setting").replace(/\\$/,""),
          screenshot: store.get("settingScreen"),
        };
        !!saveTo.filePaths[0] &&
          saveFileTest(JSON.stringify(setting), mainWindow);
      });
  });
};

const saveFileTest = (saveTo, mainWindow) => {
  mkdirsSync(SETTING_FILES_ITEM);
  fs.writeFile(SETTING_FILES_ITEM + "/setting.txt", saveTo, function (err) {
    if (err) {
      return console.log(err);
    }
    store.set("chatSetting", JSON.parse(saveTo).chatpath);
    console.log("The chatfile was saved!");
    mainWindow.webContents.send("saveSuccess");
  });
};

const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
};

module.exports = selectChatPath;
