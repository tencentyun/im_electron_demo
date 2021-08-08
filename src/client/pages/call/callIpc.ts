import { ipcRenderer } from 'electron';
import eventEmiter from './event';


export const eventListiner = {
    init: () => {
        ipcRenderer.on('pass-call-data', (event, data) => {
            eventEmiter.emit('getData', JSON.parse(data));
        });

        ipcRenderer.on('exit-room', () => {
            eventEmiter.emit('exitRoom');
        });
    },
    remoteUserJoin: userId => {
        ipcRenderer.send('remote-user-join', userId)
    },
    remoteUserExit: userId => {
        ipcRenderer.send('remote-user-exit', userId)
    },
    acceptCall: (inviteID) => {
        ipcRenderer.send('accept-call', inviteID);
        eventEmiter.emit('changeWindowType', 'callWindow');
    },
    refuseCall: (inviteID) => {
        ipcRenderer.send('refuse-call',inviteID);
    }
}
