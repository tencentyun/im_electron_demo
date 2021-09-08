import { ipcRenderer } from 'electron';
import { OPEN_REMINDER_WINDOW } from "../../app/const/reminderConst";

const openReminderWindow = (data) => {
    ipcRenderer.send(OPEN_REMINDER_WINDOW, data);
}
export {
    openReminderWindow
}