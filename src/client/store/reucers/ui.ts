import { CHANGE_FUNCTION_TYPE } from "../actions/ui";

const initState = {
    function_tab: "message"
}


const UIReducer = (state = initState, action: { type: any; payload: any }) => {
    const { type , payload } = action;
    switch (type) {
        case CHANGE_FUNCTION_TYPE:
            return {
                ...state,
                function_tab: payload
            }
        default:
          return state;
        }
}

export default UIReducer;