import { ipcRenderer } from 'electron';
import eventEmiter from './event';


export const eventListiner = {
    init: () => {
        ipcRenderer.on('pass-call-data', (event, data) => {
            eventEmiter.emit('getData', JSON.parse(data));
        });
    },
    acceptCall: () => {
        ipcRenderer.send('accept-call');
        eventEmiter.emit('changeWindowType', 'callWindow');
    },
    refuseCall: () => {
        ipcRenderer.send('refuse-call');
    }
}
