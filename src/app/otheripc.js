
const { ipcMain } = require('electron')
let appWindow = null
function openWindow() {
  if (appWindow) {
    appWindow.show();
  }
}
function setTaryTitle() {
  //appTray.setTitle(num === 0 ? "" : `${num}`);
  appWindow.flashFrame(true);
  // if (!hasFlash) {
  //   trayFlash();
  // }
}
const setOtherIPC = (win) => {
    appWindow = win
    ipcMain.on("asynchronous-message", function (event, arg) {
        const [type, data] = arg.split(",");
        switch (type) {
          case "openWindow":
            openWindow();
            break;
          case "setTaryTitle":
            if (process.platform == "darwin") {
              if (!appWindow.isVisible()) {
                setTaryTitle();
              }
            } else {
              setTaryTitle();
            }
            break;
        }
      });
}

module.exports = setOtherIPC