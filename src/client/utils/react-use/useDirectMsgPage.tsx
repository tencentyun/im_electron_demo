
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateCurrentSelectedConversation, updateConversationList } from '../../store/actions/conversation';
import { changeFunctionTab, replaceRouter } from '../../store/actions/ui';

type Params = {
    profile: State.userProfile & State.groupProfile,
    convType: number,
    beforeDirect?: () => void
}

export const useMessageDirect = () => {
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const history = useHistory();
    const { conversationList } = useSelector((state: State.RootState) => state.conversation);

    return (params: Params) => {
        const { profile, convType, beforeDirect } = params;
        const convId = profile.group_detial_info_group_id ?? profile.user_profile_identifier;
        const matchedConversation = conversationList.find(item => item.conv_id === convId);
        const hasConversation = !!matchedConversation;
        const emptyConv:State.conversationItem = {
            conv_active_time: 0,
            conv_id: convId,
            conv_is_has_draft: false,
            conv_is_has_lastmsg: false,
            conv_is_pinned: false,
            conv_profile: profile,
            conv_recv_opt: 0,
            conv_type: convType,
            conv_unread_num: 0,
            conv_group_at_info_array: [],
            // @ts-ignore
            conv_last_msg: {
                message_server_time: Math.floor(new Date().getTime() / 1000)
            }
        }

        // 切换function_atb
        dispatch(changeFunctionTab('message'))
        if(hasConversation) {
            dispatch(updateCurrentSelectedConversation(matchedConversation));
        } else {
            dispatch(updateCurrentSelectedConversation(emptyConv));
            dispatch(updateConversationList([emptyConv]));
        }
        beforeDirect && beforeDirect();
        const isMessagePage = pathname.includes('/home/message')
        if(!isMessagePage) {
            dispatch(replaceRouter(true))
            history.replace('/home/message');
        }
    }
}