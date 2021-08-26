const  { ipcMain, dialog } = require('electron');
const { SETTING_FILES_ITEM } = require('./const/const')
const fs = require('fs');
const path = require("path")

const selectPathIPC = () => {
    ipcMain.on("selectpath", function (event, data) {
        dialog.showOpenDialog({
          title: '选择存放文件',
          buttonLabel:"确定",
          properties: ['openDirectory', 'createDirectory']
        }).then(saveTo => {
            const setting = {
                selectpath:saveTo.filePaths[0],
                screenshot:""
            }
            saveFileTest(JSON.stringify(setting))
        });
      });
}


const saveFileTest = (saveTo) => {
    mkdirsSync(SETTING_FILES_ITEM)
    fs.writeFile(SETTING_FILES_ITEM + "/setting.txt", saveTo, function(err) {
        if(err) {
            return console.log(err);
        }
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
