import { createStore, combineReducers } from "redux";
import login from './reucers/login';
import userInfo from './reucers/user';

const combinedReducer = combineReducers({login, userInfo});

const store = createStore(combinedReducer);

export default store;