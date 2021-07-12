export const ADD_MESSAGE = "ADD_MESSAGE";
export const RECI_MESSAGE = "RECI_MESSAGE";
export const SEND_MESSAGE = "SEND_MESSAGE";

type Payload = {
    convId: string;
    message: State.message
}

export const addMessage = (payload: Payload) : State.actcionType<Payload> => ({
    type: ADD_MESSAGE,
    payload
});
