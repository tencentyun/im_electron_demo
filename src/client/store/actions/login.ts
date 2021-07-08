export const SET_IS_LOGIN = 'SET_IS_LOGIN';

type actcionType<T> = {
    type: string;
    payload: T;
}

export const setIsLogInAction = (payload: boolean) : actcionType<boolean> => ({
    type: SET_IS_LOGIN,
    payload
})