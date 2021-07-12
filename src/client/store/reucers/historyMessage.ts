import { ADD_MESSAGE } from "../actions/message";

const initState = {
    historyMessageList: new Map()
}

type Payload = {
  convId: string;
  message: State.message
}

const messageReducer = (state = initState, action: { type: any; payload: Payload }) => {
    const { type , payload } = action;
    switch (type) {
        case ADD_MESSAGE:
          return {
              ...state,
              historyMessageList: state.historyMessageList.set(payload.convId, payload.message)
          }
        default:
          return state;
        }
}

export default messageReducer;