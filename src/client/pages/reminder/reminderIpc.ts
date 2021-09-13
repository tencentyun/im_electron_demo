import { ipcRenderer } from 'electron';
import eventEmiter from './event';
export const eventListiner = {
    init: () => {
        ipcRenderer.on('reminder-creat-data', (event, data) => {
            eventEmiter.emit('getReminderData', JSON.parse(data));
        });

        ipcRenderer.on('reminder-exit', () => {
            eventEmiter.emit('reminderExit');
        });
    },
    // remoteUserJoin: userId => {
    //     ipcRenderer.send('remote-user-join', userId)
    // }
}
