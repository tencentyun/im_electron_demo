import { GET_SECTION_COUNT } from '../actions/section'

enum typeEnum {
    GET_SECTION_COUNT ='GET_SECTION_COUNT'
}

const initState = {
    section:[]
}
const sectionReducer = (state = initState, action: { type: typeEnum; payload: any }) => {
    const { type , payload } = action;
    switch (type) {
        case GET_SECTION_COUNT:
          return {
              ...state,
              section: payload
          }
        default:
          return state;
        }
}

export default sectionReducer;