export const SET_IS_LOGIN = 'SET_IS_LOGIN';

export const setIsLogInAction = (payload: boolean) : State.actcionType<boolean> => ({
    type: SET_IS_LOGIN,
    payload
})