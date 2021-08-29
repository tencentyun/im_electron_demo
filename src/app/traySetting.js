const { Menu, Tray, app, nativeImage, dialog } = require('electron')
const { description } = require('../../package.json')
const path = require("path")
const log = require('electron-log');
const setAppTray = (appWindow) => {
    log.info(path.join(process.cwd(), "./resources/extraResources", "notification.ico"))
    const trayIcon = nativeImage.createFromPath(
        path.join(process.cwd(), "./resources/extraResources", "notification.ico")
    );
    
    // 系统托盘右键菜单
    const trayMenuTemplate = [
        {
            label: "退出",
            click: () => {
                if (app) {
                    app.exit();
                }
            },
        },
    ];

    // 系统托盘图标目录


    const appTray = new Tray(trayIcon);

    // 图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

    // 设置此托盘图标的悬停提示内容
    appTray.setToolTip(description);

    // 设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);

    appTray.on("click", () => {
        if (appWindow) {
            appWindow.show();
        }
    });
    return appTray;
};

module.exports = setAppTray