import { REPLACE_CONV_LIST, SET_UNREAD_COUNT, UPDATE_CONVERSATIONLIST, UPDATE_CURRENT_SELECTED_CONVERSATION } from '../actions/conversation';

const initState = {
    unreadCount: 0,
    conversationList:[],
    currentSelectedConversation: null
}
const sortByPindAndTime = (conversationList:Array<State.conversationItem>) :Array<State.conversationItem>=>{
    return  conversationList.sort((pre,next)=>{
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
        case UPDATE_CONVERSATIONLIST:
            // 会话按是否置顶、时间排序
            const listCopy = [...state.conversationList]
            for(let i = 0;i<action.payload.length;i++){
                const { conv_id } = action.payload[i];
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
            }
            return {
                ...state,
                conversationList: listCopy
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
        default:
          return state;
    }
}

export default conversationReducer;