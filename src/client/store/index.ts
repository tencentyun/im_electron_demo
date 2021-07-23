import { createStore, combineReducers } from "redux";
import login from './reucers/login';
import userInfo from './reucers/user';
import conversation from './reucers/conversation'
import historyMessage from './reucers/historyMessage'
import section from './reucers/section'
import ui from './reucers/ui'
const combinedReducer = combineReducers({login, userInfo ,conversation, historyMessage,ui,section});

const store = createStore(combinedReducer);

export default store;