import React, { useState } from "react";
import { Button, PopConfirm } from "tea-component";
import { Avatar } from "../../../components/avatar/avatar";
import { deleteFriend } from "./api";
import "./friend-list.scss";

export const ListItem = (props: {
  faceUrl: string;
  userId: string;
  userName: string;
  depName: string;
  onRefresh: () => Promise<any>;
}) => {
  const { faceUrl, userId, userName, depName, onRefresh } = props;
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try{
      await deleteFriend(userId);
      await onRefresh();
    }catch(e) {
      console.log(e);
    }
    setDeleteLoading(false);
  }

  return (
    <div className="friend-list--content__item">
      <div className="item-left">
        <div className="item-left__avatar">
          <Avatar url={faceUrl} userID={userId} nickName={userName} />
        </div>
        <div className="item-left__info">
          <span className="item-left__info--name">{userName || userId}</span>
          {/* <span className="item-left__info--dep">{depName}</span> */}
        </div>
      </div>
      <div className="item-right">
      <PopConfirm
            title="确认要删除该好友吗?"
            footer={(close) => (
              <>
                <Button
                  type="link"
                  loading={deleteLoading}
                  onClick={async () => {
                    await handleDelete();
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
       <Button type="link" className="item-right__btn">删除</Button>
       </PopConfirm>
      </div>
    </div>
  );
};
