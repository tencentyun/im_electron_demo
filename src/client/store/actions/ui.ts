export const CHANGE_FUNCTION_TYPE = "CHANGE_FUNCTION_TYPE"
export const REPLACE_ROUTER = "REPLACE_ROUTER"

export const changeFunctionTab = (payload: string) : State.actcionType<string> => ({
    type: CHANGE_FUNCTION_TYPE,
    payload
})


export const replaceRouter = (payload: boolean): State.actcionType<boolean> => ({
    type: REPLACE_ROUTER,
    payload
})