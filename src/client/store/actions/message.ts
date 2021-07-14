const ADD_MESSAGE = "ADD_MESSAGE";
const RECI_MESSAGE = "RECI_MESSAGE";
const DELETE_MESSAGE = "DELETE_MESSAGE";
const MARKE_MESSAGE_AS_REVOKED = "MARKE_MESSAGE_AS_REVOKED";

export enum ActionTypeEnum {
    ADD_MESSAGE = "ADD_MESSAGE",
    RECI_MESSAGE = "RECI_MESSAGE",
    MARKE_MESSAGE_AS_REVOKED = "MARKE_MESSAGE_AS_REVOKED",
    DELETE_MESSAGE = "DELETE_MESSAGE",
}

export type Action = {
    type: ActionTypeEnum,
    payload: Payload & ReciMessagePayload & UpdateMessagePayload & DeleteMessagePayload
}


type Payload = {
    convId: string;
    messages: State.message[]
}
type ReciMessagePayload  = {
    convId: string;
    messages: State.message[]
}

type UpdateMessagePayload= {
    convId: string;
    messageId: string
}

type DeleteMessagePayload = {
    convId: string;
    messageId: string
}

export const addMessage = (payload: Payload) : State.actcionType<Payload> => ({
    type: ADD_MESSAGE,
    payload
});

export const reciMessage = (payload: ReciMessagePayload) : State.actcionType<ReciMessagePayload> => ({
    type: RECI_MESSAGE,
    payload
});

export const markeMessageAsRevoke = (payload: UpdateMessagePayload) : State.actcionType<UpdateMessagePayload> => ({
    type: MARKE_MESSAGE_AS_REVOKED,
    payload
});

export const deleteMessage = (payload: DeleteMessagePayload) : State.actcionType<DeleteMessagePayload> => ({
    type: DELETE_MESSAGE,
    payload
});