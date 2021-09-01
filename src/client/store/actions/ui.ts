export const CHANGE_FUNCTION_TYPE = "CHANGE_FUNCTION_TYPE";
export const REPLACE_ROUTER = "REPLACE_ROUTER";
export const UPDATE_CALLING_STATUS = "UPDATE_CALLING_STATUS";
export const CHANGE_SHOW_MODAL = "CHANGE_SHOW_MODAL";

type CallingPayload = {
    callingId: string,
    callingType: number,
    inviteeList: Array<string>,
    callType: number
}

type ShowModalPayload = {
    isShow: number,
    showArray: Array<string>
}

export const changeFunctionTab = (payload: string) : State.actcionType<string> => ({
    type: CHANGE_FUNCTION_TYPE,
    payload
})

export const replaceRouter = (payload: boolean): State.actcionType<boolean> => ({
    type: REPLACE_ROUTER,
    payload
})

export const updateCallingStatus = (payload: CallingPayload) : State.actcionType<CallingPayload> => ({
    type: UPDATE_CALLING_STATUS,
    payload
})

export const changeShowModal = (payload: ShowModalPayload) : State.actcionType<ShowModalPayload> => ({
    type: CHANGE_SHOW_MODAL,
    payload
})