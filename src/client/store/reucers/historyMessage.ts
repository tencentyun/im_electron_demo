import { ADD_MESSAGE } from "../actions/message";

const initState = {
    historyMessageList: new Map()
}


const messageReducer = (state = initState, action: { type: any; payload: any }) => {
    const { type , payload } = action;
    switch (type) {
        case ADD_MESSAGE:
          return {
              ...state,
              historyMessageList: payload
          }
        default:
          return state;
        }
}

export default messageReducer;