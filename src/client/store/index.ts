import { createStore, combineReducers } from "redux";
import login from './reucers/login';

const combinedReducer = combineReducers({login});

const store = createStore(combinedReducer);

export default store;