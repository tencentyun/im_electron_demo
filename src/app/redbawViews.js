const { ipcMain } = require("electron");

const redbawViews = (rendererAWindow)=>{
        //刷新视图
        ipcMain.on("onRedbawViews", function (event, data, sendData) {
            switch(data){
                case 0:
                    //更新群成员
                    rendererAWindow.webContents.send('updataCluster', sendData);
                case 1:
                    //更新会话视图
                    rendererAWindow.webContents.send('updataMessage');    
                    break;
                case 2:
                    //更新群未决消息
                    rendererAWindow.webContents.send('updataGroupUnsettled');  
                    break;  
                default:
                    console.log("暂无此类型刷新")
                    break;    
            }
        })
}
module.exports = redbawViews;