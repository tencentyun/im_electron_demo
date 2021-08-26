const { ipcMain } = require("electron");

const setkeyBoard = (callback, mainWindow) => {
    
  // 示例  callback(value,"CommandOrControl+Shift+D");
  ipcMain.on("SHORTCUT.REGISTER", function (event, data) {
    callback(mainWindow, data);
  });
};
module.exports = setkeyBoard;
