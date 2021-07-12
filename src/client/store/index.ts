import { createStore, combineReducers } from "redux";
import login from './reucers/login';
import userInfo from './reucers/user';
import conversation from './reucers/conversation'
import historyMessage from './reucers/historyMessage'
const combinedReducer = combineReducers({login, userInfo ,conversation, historyMessage});

const store = createStore(combinedReducer);

export default store;