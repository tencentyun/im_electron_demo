export const SET_UNREAD_COUNT = 'SET_UNREAD_COUNT';
export const UPDATE_CONVERSATIONLIST = 'UPDATE_CONVERSATIONLIST'

export const setUnreadCount = (payload: number) : State.actcionType<number> => ({
    type: SET_UNREAD_COUNT,
    payload
})
export const updateConversationList = (payload:Array<State.conversationItem>):State.actcionType<Array<State.conversationItem>> => ({
    type: UPDATE_CONVERSATIONLIST,
    payload
})
