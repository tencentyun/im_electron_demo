declare namespace State {
    export type RootState = {
        login: {
            isLogin: boolean;
        },
        userInfo: userInfo,
        conversation: conversation
    }

    export type conversation = {
        unreadCount: number
    }
    export type userInfo = {
        userId: string,
        faceUrl: string,
        nickName: string,
        role: number
    }

    export type actcionType<T> = {
        type: string;
        payload: T;
    }
}