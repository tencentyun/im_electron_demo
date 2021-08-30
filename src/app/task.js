const { app } = require('electron')
const addTask = () => {
    app.setUserTasks([])
    app.setUserTasks([
        {
            program: process.execPath,
            arguments: '--hide-window',
            iconPath: process.execPath,
            iconIndex: 0,
            title: '关闭程序',
            description: '关闭程序'
        }
    ])
}
module.exports = addTask;