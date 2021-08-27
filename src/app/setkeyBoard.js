const { ipcMain, globalShortcut } = require("electron");
const fs = require("fs");
const { SETTING_FILES_ITEM } = require("./const/const");
const Store = require("electron-store");
const store = new Store();

/**
 * 存储配置文件
 * @param {*} saveTo 写入的值
 */
const saveFileTest = (saveTo) => {
  mkdirsSync(SETTING_FILES_ITEM);
  fs.writeFile(SETTING_FILES_ITEM + "/setting.txt", saveTo, function (err) {
    if (err) {
      return console.log(err);
    }
  });
};
const  mkdirsSync = (dirname)=> {
  if (fs.existsSync(dirname)) {
      return true;
  } else {
      if (mkdirsSync(path.dirname(dirname))) {
          fs.mkdirSync(dirname);
          return true;
      }
  }
}
/**
 * 调起注册事件
 * @param {*} callback  回调函数
 * @param {*} mainWindow 主程序
 */

const setkeyBoard = (callback, mainWindow) => {
  // 示例  callback(value,"CommandOrControl+Shift+D");
  ipcMain.on("SHORTCUT.REGISTER", function (event, data) {
    let formatSelectpath = store.get("setting")
    fileDataJson = {
      selectpath: formatSelectpath.replace(/\\$/,""),
      screenshot: data,
    };
    saveFileTest(JSON.stringify(fileDataJson));
    store.set("settingScreen", data);
    callback(mainWindow);
  });
  ipcMain.on("SHORTCUT.UNREGISTER", function (event, data) {
    globalShortcut.unregister(data);
  });
};
module.exports = setkeyBoard;
