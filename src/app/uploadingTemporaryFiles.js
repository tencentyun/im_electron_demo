
const { TEMPORARY_FILES } = require('./const/const')
const { ipcMain } = require("electron");
const fs = require('fs');
const path = require('path');

const checkFileIsOpen = (filePath) => {
    try {
        fs.openSync(filePath, 'r+');
        return false;
    } catch(err) {
        return true;
    }
}

const temporaryFiles = (mainWindow) => {
    mkdirsSync(TEMPORARY_FILES)
    ipcMain.on("temporaryFiles", function (event, data) {
        mkdirsSync(TEMPORARY_FILES)
        let isDirectory = false
        if (data.length) {

            //上传文件是否存在文件夹
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if (element.elem_type === 4) {
                    let FSstatSync = fs.statSync(element.file_elem_file_path)
                    if (FSstatSync.isDirectory()) {
                        isDirectory = true
                        break;
                    }
                }
            }

            if (!isDirectory) {
                data.forEach(element => {
                    if (element.elem_type === 4) {
                        try {
                            //上传文件复制临时文件
                            console.log("上传文件复制临时文件", TEMPORARY_FILES + '\\' + element.file_elem_file_name)
                            let copyFileSync = fs.copyFileSync(element.file_elem_file_path, TEMPORARY_FILES + '\\' + element.file_elem_file_name)
                            element.file_elem_file_path = TEMPORARY_FILES + '\\' + element.file_elem_file_name
                        } catch (error) {
                            console.log("上传前拷贝报错", error)
                        }
                    }
                });
            }
        }

        mainWindow.webContents.send('temporaryFilesWeb', {
            messageElementArray: data,
            isDirectory: isDirectory
        })
    });

    //删除临时上传文件
    ipcMain.on("delectTemporaryFiles", function (event, data) {
        delDir(TEMPORARY_FILES)
    })
}

const mkdirsSync = (dirname) => {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}


//删除预存上传文件
const delDir = (path) => {

    try {
        let files = [];

        if (fs.existsSync(path)) {

            files = fs.readdirSync(path);

            files.forEach((file, index) => {

                let curPath = path + "\\" + file;

                if (fs.statSync(curPath).isDirectory()) {

                    delDir(curPath); //递归删除文件夹

                } else {

                    fs.unlinkSync(curPath); //删除文件

                }

            });

            // fs.rmdirSync(path);
        }
    } catch (error) {
        //兼容SDK有换成情况上传很快的情况
        console.log("文件夹内不存在相应文件", error)
    }

}


module.exports = temporaryFiles;