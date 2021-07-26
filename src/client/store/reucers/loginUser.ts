import { GET_SECTION_COUNT } from '../actions/section'

enum typeEnum {
    GET_SECTION_COUNT ='GET_SECTION_COUNT'
}

const initState = {
    loginUser:{}
}

interface UserLogin {
    userId:string,
    userSig:string
}

const loginUserReducer = (state = initState, loginUser: { type: typeEnum; payload: UserLogin }) => {
    const { type , payload } = loginUser;
    switch (type) {
        case GET_SECTION_COUNT:
          return {
              ...state,
              loginUser: payload
          }
        default:
          return state;
        }
}

export default loginUserReducer;