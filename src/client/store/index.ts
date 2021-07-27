import { createStore, combineReducers } from "redux";
import login from './reucers/login';
import userInfo from './reucers/user';
import loginUser  from './reucers/loginUser'
import conversation from './reucers/conversation'
import historyMessage from './reucers/historyMessage'
import section from './reucers/section'
import ui from './reucers/ui'
import userTypeList from './reucers/userTypeList'
import groupDrawer from './reucers/groupDrawer';


const appReducer = combineReducers({ login, userInfo, conversation, historyMessage, ui, userTypeList, groupDrawer, section,loginUser });

const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

const store = createStore(rootReducer);

export default store;