export const SET_USER_INFO = 'SET_USER_INFO';

type actcionType<T> = {
    type: string;
    payload: T;
}

type userInfo = {
    userId: string,
    faceUrl: string,
    nickName: string,
    role: number
}

export const setUserInfo = (payload: userInfo) : actcionType<userInfo> => ({
    type: SET_USER_INFO,
    payload
});