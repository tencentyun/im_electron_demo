export const GET_SECTION_COUNT = 'GET_SECTION_COUNT';

export const setUnreadCount = (payload: Array<Object>) : State.actcionType<Array<Object>> => ({
    type: GET_SECTION_COUNT,
    payload
})