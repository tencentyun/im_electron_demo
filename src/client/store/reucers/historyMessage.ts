import {  ActionTypeEnum, Action } from "../actions/message";

const initState = {
    historyMessageList: new Map()
}

const messageReducer = (state = initState, action: Action): State.historyMessage => {
    const { type , payload } = action;
    switch (type) {
        case ActionTypeEnum.ADD_MESSAGE: {
          return {
            ...state,
            historyMessageList: state.historyMessageList.set(payload.convId, payload.messages)
          }
        }
         
        case ActionTypeEnum.RECI_MESSAGE: {
          const history = state.historyMessageList.get(payload.convId);
          return {
            ...state,
            historyMessageList: state.historyMessageList.set(payload.convId,payload.messages.concat(history))
          }
        }

        case ActionTypeEnum.MARKE_MESSAGE_AS_REVOKED: {
          const { convId, messageId } = payload;
          const history = state.historyMessageList.get(convId);
          const replacedMessageList = history.map(item => {
            if(item.message_msg_id === messageId || item.message_unique_id === messageId) {
              return {
                ...item,
                message_status: 6
              }
            }
            return item
          });
          return {
            ...state,
            historyMessageList: state.historyMessageList.set(convId, replacedMessageList)
          }
        }

        case ActionTypeEnum.DELETE_MESSAGE: {
          const { convId, messageId } = payload;
          const history = state.historyMessageList.get(convId);
          const replacedMessageList = history.filter(item => item.message_msg_id !== messageId);
          return {
            ...state,
            historyMessageList: state.historyMessageList.set(convId, replacedMessageList)
          }
        }

        default:
          return state;
        }
}

export default messageReducer;