import { createStore, combineReducers } from "redux";
import login from './reucers/login';
import userInfo from './reucers/user';
import conversation from './reucers/conversation'
import historyMessage from './reucers/historyMessage'
import ui from './reucers/ui'
import userTypeList from './reucers/userTypeList'
const combinedReducer = combineReducers({login, userInfo ,conversation, historyMessage,ui, userTypeList});

const rootReducer = (state, action) => {
    if (action.type === 'USER_LOGOUT') {
      return combinedReducer(undefined, action)
    }
  
    return combinedReducer(state, action)
  }

const store = createStore(rootReducer);

export default store;