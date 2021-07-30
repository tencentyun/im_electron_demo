import { SET_IMG_VIEWER } from '../actions/imgViewer';

const initState = {
    isShow: false,
    imgs: [],
    isCanOpenFileDir: false,
    index: 0
}

const imgViewerReducer = (state = initState, action: { type: any; payload: any }) => {
    switch (action.type) {
        case SET_IMG_VIEWER:
            return {
                ...state,
                isShow: action.payload.isShow,
                imgs: action.payload.imgs,
                isCanOpenFileDir: action.payload.isCanOpenFileDir,
                index: action.payload.index
            }
        default:
            return state;
    }
}

export default imgViewerReducer;