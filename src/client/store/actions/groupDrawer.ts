export const CHANGE_TOOLS_TYPE = "CHANGE_TOOLS_TYPE";

export const changeToolsTab = (payload: string) : State.actcionType<string> => ({
  type: CHANGE_TOOLS_TYPE,
  payload
})