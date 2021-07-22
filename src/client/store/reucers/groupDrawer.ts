import { CHANGE_TOOLS_TYPE } from "../actions/groupDrawer";

const initState = {
  tools_tab: "",
};

const GroupDrawerReducer = (state = initState, action: { type: any; payload: any }) => {
  const { type, payload } = action;
  switch (type) {
    case CHANGE_TOOLS_TYPE:
      return {
        ...state,
        tools_tab: payload,
      };

    default:
      return state;
  }
};

export default GroupDrawerReducer;
