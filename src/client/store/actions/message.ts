const ADD_MESSAGE = "ADD_MESSAGE";
const RECI_MESSAGE = "RECI_MESSAGE";
const DELETE_MESSAGE = "DELETE_MESSAGE";
const MARKE_MESSAGE_AS_REVOKED = "MARKE_MESSAGE_AS_REVOKED";
const MARKE_MESSAGE_AS_READED = "MARKE_MESSAGE_AS_READED";
const ADD_MORE_MESSAGE = "ADD_MORE_MESSAGE";
const UPDATE_MESSAGES = "UPDATE_MESSAGES"
const UPDATE_MESSAGE_ELEM_PROGRESS = "UPDATE_MESSAGE_ELEM_PROGRESS"
const SET_CURRENT_REPLY_USER = "SET_CURRENT_REPLY_USER"
const CLEAR_HISTORY = 'CLEAR_HISTORY'
const REPLACE_MESSAGE = 'REPLACE_MESSAGE'
const UPDATE_FILE_MESSAGE_DOWNLOAD_STATUS = 'UPDATE_FILE_MESSAGE_DOWNLOAD_STATUS';
export enum ActionTypeEnum {
    ADD_MESSAGE = "ADD_MESSAGE",
    RECI_MESSAGE = "RECI_MESSAGE",
    MARKE_MESSAGE_AS_REVOKED = "MARKE_MESSAGE_AS_REVOKED",
    DELETE_MESSAGE = "DELETE_MESSAGE",
    MARKE_MESSAGE_AS_READED = "MARKE_MESSAGE_AS_READED",
    ADD_MORE_MESSAGE = "ADD_MORE_MESSAGE",
    UPDATE_MESSAGES = "UPDATE_MESSAGES",
    UPDATE_MESSAGE_ELEM_PROGRESS = "UPDATE_MESSAGE_ELEM_PROGRESS",
    SET_CURRENT_REPLY_USER = "SET_CURRENT_REPLY_USER",
    CLEAR_HISTORY = 'CLEAR_HISTORY',
    REPLACE_MESSAGE = 'REPLACE_MESSAGE',
    UPDATE_FILE_MESSAGE_DOWNLOAD_STATUS = 'UPDATE_FILE_MESSAGE_DOWNLOAD_STATUS'
}

export type Action = {
    type: ActionTypeEnum,
    payload: Payload & ReciMessagePayload & UpdateMessagePayload & UpdateMessageElemProgressPayload & UpdateMessagesPayload & DeleteMessagePayload & MarkeMessageAsReadedPayload & SetCurrentReplyUserPayload & ReplaceMessagePayload & UpdateFileMessageDownloadStatusPayload
}

type AddMoreMessage = {
    convId: string;
    messages: State.message[]
}

type Payload = {
    convId: string;
    messages: State.message[]
}
type ReciMessagePayload  = {
    convId: string;
    messages: State.message[]
}

type UpdateMessagesPayload  = {
    convId: string;
    message: State.message;
}

type UpdateMessageElemProgressPayload = {
    messageId: string;
    index: number;
    cur_size: number;
    total_size: number;
}

type UpdateMessagePayload= {
    convId: string;
    messageId: string
}

type DeleteMessagePayload = {
    convId: string;
    messageIdArray: Array<string>
}

type MarkeMessageAsReadedPayload = {
    convIds: [string]
}

type ReplaceMessagePayload = {
    convId: string;
    messageId: string;
    message: State.message;
}

type UpdateFileMessageDownloadStatusPayload = {
    messageId: string;
    index: number;
    isDownloading: boolean;
    downloadPercentage?: number;

}

export const getUserStatus = (payload: Payload) : State.actcionType<Payload> => ({
    type: ADD_MESSAGE,
    payload
});
type SetCurrentReplyUserPayload = {
    profile: State.userProfile
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

export const markMessageAsReaded = (payload: MarkeMessageAsReadedPayload) : State.actcionType<MarkeMessageAsReadedPayload> => ({
    type: MARKE_MESSAGE_AS_READED,
    payload
})

export const addMoreMessage = (payload: AddMoreMessage) : State.actcionType<AddMoreMessage> => ({
    type: ADD_MORE_MESSAGE,
    payload
})

export const updateMessages = (payload: UpdateMessagesPayload) : State.actcionType<UpdateMessagesPayload> => ({
    type: UPDATE_MESSAGES,
    payload
});

export const updateMessageElemProgress = (payload: UpdateMessageElemProgressPayload) : State.actcionType<UpdateMessageElemProgressPayload> => ({
    type: UPDATE_MESSAGE_ELEM_PROGRESS,
    payload
});

export const setCurrentReplyUser = (payload: SetCurrentReplyUserPayload): State.actcionType<SetCurrentReplyUserPayload> => ({
    type: SET_CURRENT_REPLY_USER,
    payload
})

export const clearHistory = () => ({
    type: CLEAR_HISTORY
})

export const replaceMessage = (payload: ReplaceMessagePayload): State.actcionType<ReplaceMessagePayload> => ({
    type: REPLACE_MESSAGE,
    payload
})

export const updateFileMessageDownloadStatus = (payload: UpdateFileMessageDownloadStatusPayload): State.actcionType<UpdateFileMessageDownloadStatusPayload> => ({
    type: UPDATE_FILE_MESSAGE_DOWNLOAD_STATUS,
    payload
}) 