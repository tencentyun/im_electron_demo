import { createStore, combineReducers } from "redux";
import login from './reucers/login';
import userInfo from './reucers/user';
import conversation from './reucers/conversation'

const combinedReducer = combineReducers({login, userInfo ,conversation});

const store = createStore(combinedReducer);

export default store;