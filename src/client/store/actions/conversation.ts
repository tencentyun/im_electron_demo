export const SET_UNREAD_COUNT = 'SET_UNREAD_COUNT';

export const setUnreadCount = (payload: number) : State.actcionType<number> => ({
    type: SET_UNREAD_COUNT,
    payload
})