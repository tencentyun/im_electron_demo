const  { ipcMain, dialog } = require('electron');
const fs = require('fs');

const setSaveFileIpc = () => {
    ipcMain.on("fileSave", function (event, data) {
        const { url, type } = data;
        dialog.showSaveDialog({
          title: '另存为',
          defaultPath: url,
          filters: [
            {name: type , extensions: [type]}
          ]
        }).then(saveTo => {
          if(saveTo.filePath) {
            fs.createReadStream(url).pipe(fs.createWriteStream(saveTo.filePath));
          }
        });
      });
}

module.exports = setSaveFileIpc;
