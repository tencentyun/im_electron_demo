import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeDrawersVisible, changeToolsTab } from "../../../store/actions/groupDrawer";
import { Avatar } from "../../../components/avatar/avatar";
import { AddUserPopover } from "../AddUserPopover";
import { GroupToolsDrawer } from "../GroupToolsDeawer";
import { GroupMemberSelector } from "../groupMemberSelector";
type Info = {
    faceUrl: string;
    nickName: string;
};
export const ConversationContentHeader = (props: {
    currentSelectedConversation
}): JSX.Element => {
    const { currentSelectedConversation } = props;
    const { conv_type, conv_id, conv_profile } = currentSelectedConversation;
    const { toolsTab, toolsDrawerVisible } = useSelector(
        (state: State.RootState) => state.groupDrawer
    );
    const dispatch = useDispatch();

    const handleClose = () => dispatch(changeDrawersVisible(false));
    const handleClick = (id: string) => dispatch(changeToolsTab(id));
    const handleShow = () => dispatch(changeDrawersVisible(true));
    const getDisplayConvInfo = () => {
        const info: Info = {
            faceUrl: "",
            nickName: "",
        };

        if (conv_type === 1) {
            info.faceUrl = currentSelectedConversation?.conv_profile?.user_profile_face_url;
            info.nickName = currentSelectedConversation.conv_profile.user_profile_nick_name;
        }

        if (conv_type === 2) {
            info.faceUrl = currentSelectedConversation?.conv_profile?.group_detial_info_face_url;
            info.nickName = currentSelectedConversation?.conv_profile?.group_detial_info_group_name;
        }
        return info;
    };
    
    const { faceUrl, nickName } = getDisplayConvInfo();
    const {
        group_detial_info_group_type: groupType,
        group_detial_info_add_option: addOption,
    } = conv_profile || {};
    // 可拉人进群条件为 当前选中聊天类型为群且群类型不为直播群且当前群没有设置禁止加入
    const canInviteMember = conv_type === 2 && [0, 1, 2].includes(groupType);

    const popupContainer = document.getElementById("messageInfo");

    const groupMemberSelectorRef = useRef(null)

    return (
        <header className="message-info-view__header">
            <div
                className="message-info-view__header--avatar"
                onClick={() => {
                    if (conv_type === 2) {
                        if (toolsDrawerVisible) {
                            handleClose();
                            handleClick("");
                        } else {
                            handleShow();
                            handleClick("setting");
                        }
                    }
                }}
            >
                <Avatar
                    url={faceUrl}
                    size="small"
                    nickName={nickName}
                    userID={conv_id}
                    groupID={conv_id}
                />
                <span className="message-info-view__header--name">
                    {nickName || conv_id}
                </span>
            </div>
            {canInviteMember ? <AddUserPopover groupId={conv_id} /> : <></>}
            <GroupToolsDrawer
                visible={toolsDrawerVisible}
                toolId={toolsTab}
                conversationInfo={currentSelectedConversation}
                popupContainer={popupContainer}
                onClose={() => {
                    handleClick("");
                    handleClose();
                }}
            />
            
        </header>
    )
}