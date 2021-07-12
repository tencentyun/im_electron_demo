export const ADD_MESSAGE = "ADD_MESSAGE";
export const UPDATE_MESSage = "UPpayloadDATE_MESSage";

type Payload = {
    convId: string;
    message: State.message
}


export const addMessage = (payload: Payload) : State.actcionType<Payload> => ({
    type: ADD_MESSAGE,
    payload
});
