import { Button, PopConfirm } from "@tencent/tea-component";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useMessageDirect } from "../../../../utils/react-use/useDirectMsgPage";
import { Avatar } from "../../../../components/avatar/avatar";
import { deleteGroup, GroupList, quitGroup } from "../api";
import "./group-item.scss";

export const GroupItem = (props: {
  groupName: string;
  groupAvatar: string;
  groupId: string;
  groupOwner: string;
  groupType: number;
  profile: any;
  onRefresh: () => Promise<GroupList>;
}): JSX.Element => {
  const { groupId, groupAvatar, groupName, groupOwner, groupType, onRefresh, profile } =
    props;

  const { userId } = useSelector((state: State.RootState) => state.userInfo);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quitLoading, setQuitLoading] = useState(false);

  const directToMsgPage = useMessageDirect();

  const canDeleteGroup = groupOwner === userId && groupType !== 1; // 是群主并且非私有群可以解散
  const canQuitGroup = groupOwner !== userId || groupType === 1; // 不是群主或者该群为私有群

  const handleItemClick = () => {
    directToMsgPage({
      convType: 2,
      profile,
    })
  }

  const handleDeleteGroup = async () => {
    try {
      setDeleteLoading(true);
      await deleteGroup(groupId);
      onRefresh();
    } catch (e) {
      console.log(e.message);
    }
    setDeleteLoading(false);
  };

  const handleQuitGroup = async () => {
    setQuitLoading(true);
    try {
      await quitGroup(groupId);
      onRefresh();
    } catch (e) {
      console.log(e.message);
    }
    setQuitLoading(false);
  };

  return (
    <div className="group-item">
      <div className="group-item--left" onClick={handleItemClick}>
        <Avatar url={groupAvatar} nickName={groupName} groupID={groupId} />
        <span className="group-item--left__name">{groupName}</span>
      </div>
      <div className="group-item--right">
        {canDeleteGroup && (
          <PopConfirm
            title="确认要解散群聊吗?"
            footer={(close) => (
              <>
                <Button
                  type="link"
                  loading={deleteLoading}
                  onClick={() => {
                    handleDeleteGroup();
                    close();
                  }}
                >
                  确认
                </Button>
                <Button type="text" onClick={close}>
                  取消
                </Button>
              </>
            )}
          >
            <Button className="group-item--right__button" type="text">
              解散群聊
            </Button>
          </PopConfirm>
        )}
        {canQuitGroup && (
          <PopConfirm
            title="确认要退出群聊吗?"
            footer={(close) => (
              <>
                <Button
                  type="link"
                  loading={quitLoading}
                  onClick={() => {
                    handleQuitGroup();
                    close();
                  }}
                >
                  确认
                </Button>
                <Button type="text" onClick={close}>
                  取消
                </Button>
              </>
            )}
          >
            <Button className="group-item--right__button" type="text">
              退出群聊
            </Button>
          </PopConfirm>
        )}
      </div>
    </div>
  );
};
