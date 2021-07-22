import { createStore, combineReducers } from "redux";
import login from './reucers/login';
import userInfo from './reucers/user';
import conversation from './reucers/conversation'
import historyMessage from './reucers/historyMessage'
import ui from './reucers/ui'
const appReducer = combineReducers({login, userInfo ,conversation, historyMessage, ui});

const rootReducer = (state, action) => {
    if (action.type === 'USER_LOGOUT') {
      return appReducer(undefined, action)
    }
  
    return appReducer(state, action)
  }

const store = createStore(rootReducer);

export default store;