export const SET_IMG_VIEWER = 'SET_IMG_VIEWER';

export const setImgViewerAction = (payload: State.imgViewer): State.actcionType<State.imgViewer> => ({
    type: SET_IMG_VIEWER,
    payload
})
