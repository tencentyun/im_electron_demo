import { SET_USER_STATUS } from "../actions/userTypeList";

const initState = []


const userTypeList = (state = initState, action: { type: any; payload: any }) => {
    const { type , payload } = action;
    // console.warn(payload,typeof(payload),'怎么可能是对象')
    switch (type) {
        case SET_USER_STATUS:
            return {
                ...state,
                ...payload
            }
        default:
          return state;
        }
}

export default userTypeList;