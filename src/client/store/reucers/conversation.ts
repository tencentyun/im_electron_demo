import { SET_UNREAD_COUNT } from '../actions/conversation';

const initState = {
    unreadCount: 0
}

const conversationReducer = (state = initState, action: { type: any; payload: any }) => {
    switch (action.type) {
        case SET_UNREAD_COUNT:
          return {
              ...state,
              unreadCount: action.payload
          }
        default:
          return state;
    }
}

export default conversationReducer;