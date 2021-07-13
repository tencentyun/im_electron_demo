export const CHANGE_FUNCTION_TYPE = "CHANGE_FUNCTION_TYPE"


export const changeFunctionTab = (payload: string) : State.actcionType<string> => ({
    type: CHANGE_FUNCTION_TYPE,
    payload
})