const  { ipcMain, dialog, ipcRenderer} = require('electron');
const { SETTING_FILES_ITEM } = require('./const/const')
const Store = require("electron-store");
const fs = require('fs');
const path = require("path")
const store = new Store();
const selectPathIPC = (createWindow) => {
    ipcMain.on("selectpath", function (event, data) {
        dialog.showOpenDialog({
          title: '选择存放文件',
          buttonLabel:"确定",
          properties: ['openDirectory', 'createDirectory']
        }).then(saveTo => {
            const setting = {
                selectpath:saveTo.filePaths[0],
                screenshot:store.get("settingScreen"),
                chatpath:store.get("chatSetting")
            }
           !!saveTo.filePaths[0]  && saveFileTest(JSON.stringify(setting), createWindow)
        });
      });
}


const saveFileTest = (saveTo, createWindow) => {
    mkdirsSync(SETTING_FILES_ITEM)
    fs.writeFile(SETTING_FILES_ITEM + "/setting.txt", saveTo, function(err) {
        if(err) {
            return console.log(err);
        }
        store.set('setting', JSON.parse(saveTo).selectpath)
        console.log("createWindow", createWindow)
        createWindow.webContents.send("saveFileTest")
        console.log("The file was saved!");
    });
}


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

module.exports = selectPathIPC;
