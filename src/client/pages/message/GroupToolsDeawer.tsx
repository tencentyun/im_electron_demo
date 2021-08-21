import { useDialogRef } from "../../utils/react-use/useDialog";
import { Drawer, H3 } from "tea-component";
import React, { useEffect, useState } from "react";

import "./group-tool-drawer.scss";
import { GroupSetting } from "./groupSetting/GroupSetting";
import { GroupAccountecmentSetting } from "./groupAccountecmentSetting/GroupAccountecmentSetting";
import { useSelector } from "react-redux";
import { GroupProfileDrawer, GroupProfileRecordsType } from "./groupSetting/GroupProfileDrawer";
import { groupProfile } from '../../typings/interface'
export interface GroupToolsgRecordsType {
  conversationInfo: State.conversationItem;
  toolId: string;
}

export const GroupToolsDrawer = (props: {
  onSuccess?: () => void;
  onClose?: () => void;
  popupContainer?: HTMLElement;
  visible: boolean;
  conversationInfo: State.conversationItem;
  toolId: string;
}): JSX.Element => {
  const { onClose, popupContainer, visible, conversationInfo, toolId } = props;
  // console.log("visible", visible);
  const { mygroupInfor, initGroupInfor} = useSelector(
      (state: State.RootState) => state.section
  );
  const { currentSelectedConversation } = useSelector(
    (state: State.RootState) => state.conversation
  );
  
  const DisplayComponent = {
    setting: GroupSetting,
    announcement: GroupAccountecmentSetting,
  }[toolId];

  const close = () => {
    onClose?.();
  };

  // console.log("toolsTab", toolId);

  const getTitleAndSubTitle = (toolsId: string) => {
    let title = "";
    let subTitle = "";
    const memberNum =
      conversationInfo?.conv_profile?.group_detial_info_member_num || 0;
    switch (toolsId) {
      case "setting":
        title = "设置";
        subTitle = `群成员 | ${memberNum}`;
        break;
      case "announcement":
        title = "群公告";
        break;
    }

    return { title, subTitle };
  };

  const { title, subTitle } = getTitleAndSubTitle(toolId);





  const profileDialogRef = useDialogRef<GroupProfileRecordsType>();
  const [groupDetail,setGroupDetail] = useState<groupProfile>()
  const [updataGroup,setUpdataGroup] = useState(-1)

  
  //自定义字段更新 刷新页面  
  //群成员身份更新 刷新页面
  useEffect(() => {
    if (visible) {
        setGroupDetail(currentSelectedConversation?.conv_profile)
    }
  }, [currentSelectedConversation?.conv_profile?.group_detial_info_custom_info]);

  useEffect(() => {
    currentSelectedConversation?.conv_profile &&   setGroupDetail(currentSelectedConversation?.conv_profile)
    if (visible) {
      close()
    }
  }, [currentSelectedConversation.conv_id]);

  useEffect(() => {
    if (visible) {
      setUpdataGroup(initGroupInfor)
    }
  },[initGroupInfor])
  const { userId } = useSelector((state: State.RootState) => state.userInfo);
    //2021年8月18日09:13:11  返回群资料自定义字段值  zwc
  const returnsCustomValue = (type_key:string):string=> {
    if(groupDetail){
      if(groupDetail.group_detial_info_custom_info && groupDetail.group_detial_info_custom_info.length){
        return groupDetail.group_detial_info_custom_info.filter(item => item.group_info_custom_string_info_key == type_key)[0].group_info_custom_string_info_value
      }else{
          return ""
      }
    }
    return " "
  }
  //针对外部   修改群资料
  const isOwener = updataGroup >= -1 && returnsCustomValue('group_permission') == '0' && (groupDetail.group_detial_info_owener_identifier === userId  || [2,3].includes(mygroupInfor?.group_member_info_member_role)) ||  returnsCustomValue('group_permission') == '1'
   //如果是讨论组没有限制可以编辑 ||   是群组开启仅管理员可修改 | 所有人可修改  针对每个input编辑
  const canEdit = updataGroup >= -1 && groupDetail?.group_detial_info_group_type == 1 || (returnsCustomValue('group_permission') == '0' && (groupDetail?.group_detial_info_group_type === 1 || [2, 3].includes(mygroupInfor?.group_member_info_member_role)) ||  returnsCustomValue('group_permission') == '1');
  
  return (
    <Drawer
      visible={visible}
      title={
        <div className="tool-drawer--title">
          <H3>{title}</H3>
          <span className="tool-drawer--title__sub">{subTitle}</span>
          { isOwener && <span className="tool-drawer--modify__profile" onClick={() => profileDialogRef.current.open({ groupDetail })}>修改群资料</span>}
        </div>
      }
      outerClickClosable={false}
      className="tool-drawer"
      popupContainer={popupContainer}
      onClose={close}
    >
      {toolId === "setting" && conversationInfo.conv_type === 2 && (
        <GroupSetting canEdit={canEdit} close={close} conversationInfo={conversationInfo} />
      )}
      {toolId === "announcement" && (
        <GroupAccountecmentSetting
          close={close}
          conversationInfo={conversationInfo}
        />
      )}
      { isOwener &&
        <GroupProfileDrawer
          popupContainer={popupContainer}
          dialogRef={profileDialogRef}
        />
      }
    </Drawer>
  );
};
