import { CHANGE_FUNCTION_TYPE, REPLACE_ROUTER } from "../actions/ui";

const initState = {
    function_tab: "message",
    replace_router: false,
}


const UIReducer = (state = initState, action: { type: any; payload: any }) => {
    const { type , payload } = action;
    switch (type) {
        case CHANGE_FUNCTION_TYPE:
            return {
                ...state,
                function_tab: payload
            }
        case REPLACE_ROUTER:
            return {
                ...state,
                replace_router: payload
            }
        default:
          return state;
        }
}

export default UIReducer;