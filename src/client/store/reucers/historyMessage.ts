import {  ActionTypeEnum, Action } from "../actions/message";
import { addTimeDivider } from "../../utils/addTimeDivider";

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
          const baseTime = history && history.length > 0 ? history[0].message_client_time : 0;
          const timeDividerResult = addTimeDivider(payload.messages, baseTime).reverse();
          return {
            ...state,
            historyMessageList: state.historyMessageList.set(payload.convId, timeDividerResult.concat(history))
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
          const replacedMessageList = history.filter(item => !item.isTimeDivider && item.message_msg_id !== messageId);
          return {
            ...state,
            historyMessageList: state.historyMessageList.set(convId, replacedMessageList)
          }
        }

        case ActionTypeEnum.MARKE_MESSAGE_AS_READED: {
          const { convIds } = payload;
          convIds.forEach(convId => {
            const messageList = state.historyMessageList.get(convId);
            messageList.forEach(item => {
              if (item.message_is_from_self) {
                item.message_is_peer_read = true;
              }
            });
            state.historyMessageList.set(convId, messageList);
          });
          return state;
        }

        default:
          return state;
        }
}

export default messageReducer;