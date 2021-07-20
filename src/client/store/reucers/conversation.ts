import { REPLACE_CONV_LIST, SET_UNREAD_COUNT, UPDATE_CONVERSATIONLIST, UPDATE_CURRENT_SELECTED_CONVERSATION, MARK_CONV_LAST_MSG_IS_READED } from '../actions/conversation';

const initState = {
    unreadCount: 0,
    conversationList:[],
    currentSelectedConversation: null
}
const sortByPindAndTime = (conversationList:Array<State.conversationItem>) :Array<State.conversationItem>=>{
    return  conversationList.sort((pre,next)=>{
        if(pre.conv_is_pinned){
            return  1
        }
        return next.conv_active_time - pre.conv_active_time
    })
}
const conversationReducer = (state = initState, action: { type: any; payload: any }) => {
    switch (action.type) {
        case SET_UNREAD_COUNT:
          return {
              ...state,
              unreadCount: action.payload
          }
        case UPDATE_CONVERSATIONLIST: {
            // 会话按是否置顶、时间排序
            // eslint-disable-next-line no-case-declarations
            const listCopy = [...state.conversationList]
            for(let i = 0;i<action.payload.length;i++){
                const { conv_id } = action.payload[i];
                console.log(listCopy.length)
                const conv_index = listCopy.findIndex((item)=>{return item.conv_id === conv_id})
                if(conv_index>-1){
                    console.log('更新会话')
                    // 存在，直接更新
                    listCopy[conv_index] = action.payload[i]
                } else {
                    console.log('添加会话')
                    // 不存在，添加
                    listCopy.unshift(action.payload[i])
                }
                console.log(listCopy.length)
            }
            return {
                ...state,
                conversationList: sortByPindAndTime(listCopy)
            }
        }
        case UPDATE_CURRENT_SELECTED_CONVERSATION:
            return {
                ...state,
                currentSelectedConversation: action.payload
            }
        case REPLACE_CONV_LIST:
            return {
                ...state,
                conversationList: action.payload
            }

        case MARK_CONV_LAST_MSG_IS_READED: {
            const catchList = [...state.conversationList];
            const { payload  } = action;
            const convIds = payload.map((element : State.MessageReceipt)  => element.msg_receipt_conv_id);
            catchList.forEach(item => {
                if(convIds.includes(item.conv_id)) {
                    if(item.conv_last_msg){
                        item.conv_last_msg.message_is_peer_read = true;
                    }
                }
            })

            return {
                ...state,
                conversationList: catchList
            }
        }
        default:
          return state;
    }
}

export default conversationReducer;