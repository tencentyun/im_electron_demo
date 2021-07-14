export const SET_UNREAD_COUNT = 'SET_UNREAD_COUNT';
export const UPDATE_CONVERSATIONLIST = 'UPDATE_CONVERSATIONLIST'
export const UPDATE_CURRENT_SELECTED_CONVERSATION = 'UPDATE_CURRENT_SELECTED_CONVERSATION'
export const REPLACE_CONV_LIST = 'REPLACE_CONV_LIST'

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

export const replaceConversaionList = (payload:Array<State.conversationItem>):State.actcionType<Array<State.conversationItem>> => ({
    type: REPLACE_CONV_LIST,
    payload
})