const { ipcMain } = require("electron");

const redbawViews = (rendererAWindow)=>{
        //刷新视图
        ipcMain.on("onRedbawViews", function (event, data) {
            switch(data){
                case 0:
                    //更新群成员
                    rendererAWindow.webContents.send('updataCluster');
                case 1:
                    //更新会话视图
                    rendererAWindow.webContents.send('updataMessage');    
                    break;
                default:
                    console.log("暂无此类型刷新")
                    break;    
            }
        })
}
module.exports = redbawViews;