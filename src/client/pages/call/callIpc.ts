import { ipcRenderer } from 'electron';
import eventEmiter from './event';

let renderProcessEvent;

export const eventListiner = {
    init: () => {
        ipcRenderer.on('pass-call-data', (event, data) => {
            renderProcessEvent = event;
            eventEmiter.emit('getData', JSON.parse(data));
            console.log('pass-call-data', data);
        });
    }
}
