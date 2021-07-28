import React from "react";
import { Button } from "tea-component";
import { Avatar } from "../../../components/avatar/avatar";
import "./friend-list.scss";

export const ListItem = (props: {
  faceUrl: string;
  userId: string;
  userName: string;
  depName: string;
  onRefresh: () => Promise<any>;
}) => {
  const { faceUrl, userId, userName, depName, onRefresh } = props;

  const handleDelete = async () => {

  }

  return (
    <div className="friend-apply--content__item">
      <div className="item-left">
        <div className="item-left__avatar">
          <Avatar url={faceUrl} userID={userId} nickName={userName} />
        </div>
        <div className="item-left__info">
          <span className="item-left__info--name">{userName}</span>
          <span className="item-left__info--dep">{depName}</span>
        </div>
      </div>
      <div className="item-right">
       <Button type="link" onClick={handleDelete}>删除</Button>
      </div>
    </div>
  );
};
