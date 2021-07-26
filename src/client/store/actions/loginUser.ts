export const GET_SECTION_COUNT = 'GET_LOGIN_USER';

interface UserLogin {
    userId:string,
    userSig:string
}   
export const loginUser = (payload: UserLogin) : State.actcionType<UserLogin> => ({
    type: GET_SECTION_COUNT,
    payload
})