import { ADD_MESSAGE, RECI_MESSAGE } from "../actions/message";

const initState = {
    historyMessageList: new Map()
}

const messageReducer = (state = initState, action: { type: any; payload: any }) => {
    const { type , payload } = action;
    switch (type) {
        case ADD_MESSAGE:
          return {
              ...state,
              historyMessageList: state.historyMessageList.set(payload.convId, payload.message)
        }
        case RECI_MESSAGE:
          const newMessage = state.historyMessageList.get(payload.keys[0]).concat(payload.values[0])
          return {
            ...state,
            historyMessageList: newMessage
          }
        default:
          return state;
        }
}

export default messageReducer;