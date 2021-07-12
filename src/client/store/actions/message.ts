export const ADD_MESSAGE = "ADD_MESSAGE"
export const RECI_MESSAGE = "RECI_MESSAGE"
export const SEND_MESSAGE = "SEND_MESSAGE"

export const addMessage = (payload: Map<string,Array<State.message>>) : State.actcionType<Map<string,Array<State.message>>> => ({
    type: ADD_MESSAGE,
    payload
})