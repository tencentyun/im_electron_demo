export const SET_USER_STATUS = 'SET_USER_STATUS'
export const getUserType = (payload:Array<State.userTypeData>) : State.actcionType<Array<State.userTypeData>> => ({
    type: SET_USER_STATUS,
    payload
})