import { SET_UNREAD_COUNT, UPDATE_CONVERSATIONLIST } from '../actions/conversation';

const initState = {
    unreadCount: 0,
    conversationList:[]
}

const conversationReducer = (state = initState, action: { type: any; payload: any }) => {
    switch (action.type) {
        case SET_UNREAD_COUNT:
          return {
              ...state,
              unreadCount: action.payload
          }
        case UPDATE_CONVERSATIONLIST:
            return {
                ...state,
                conversationList: action.payload
            }
        default:
          return state;
    }
}

export default conversationReducer;