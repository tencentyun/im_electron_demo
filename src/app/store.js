
const { ipcMain }  = require ("electron");
const Store = require("electron-store");
const store = new Store();

const initStore = () => {
    ipcMain.on("CHANGESTORE", function (event, data) {
        store.set("sendType", data);
    });
}

module.exports =  initStore;