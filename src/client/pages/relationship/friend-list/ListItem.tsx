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

  const handleDelete = async (close: () => any) => {
    try {
      await deleteFriend(userId);
      close();
      onRefresh();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="friend-apply--content__item">
      <div className="item-left">
        <div className="item-left__avatar">
          <Avatar url={faceUrl} userID={userId} nickName={userName} key={ faceUrl }/>
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
              <Button type="link" onClick={() => handleDelete(close)}>
                确认
              </Button>
              <Button type="text" onClick={close}>
                取消
              </Button>
            </>
          )}
        >
          <Button type="link" className="item-right__btn">
            删除
          </Button>
        </PopConfirm>
      </div>
    </div>
  );
};
