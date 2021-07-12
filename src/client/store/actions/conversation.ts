export const SET_UNREAD_COUNT = 'SET_UNREAD_COUNT';
export const UPDATE_CONVERSATIONLIST = 'UPDATE_CONVERSATIONLIST'
export const UPDATE_CURRENT_SELECTED_CONVERSATION = 'UPDATE_CURRENT_SELECTED_CONVERSATION'



export const setUnreadCount = (payload: number) : State.actcionType<number> => ({
    type: SET_UNREAD_COUNT,
    payload
})
export const updateConversationList = (payload:Array<State.conversationItem>):State.actcionType<Array<State.conversationItem>> => ({
    type: UPDATE_CONVERSATIONLIST,
    payload
})


export const updateCurrentSelectedConversation = (payload :State.conversationItem) :State.actcionType<State.conversationItem> => ({
    type: UPDATE_CURRENT_SELECTED_CONVERSATION,
    payload
})