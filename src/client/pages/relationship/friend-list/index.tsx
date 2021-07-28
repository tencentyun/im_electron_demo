import React from "react";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import { getFriendList } from "./api";
import { ListItem } from "./ListItem";
import "./friend-list.scss";

export const FriendList = () => {
  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    return await getFriendList();
  }, []);

  const friendList = value || [];

  return (
    <div className="friend-list">
      <div className="friend-list--title">
        <span className="friend-list--title__icon"></span>
        <span className="friend-list--title__text">好友列表</span>
      </div>
      <div className="friend-list--content">
        {friendList.map((v) => (
          <ListItem
            key={v.friend_profile_identifier}
            userId={v.friend_profile_identifier}
            userName={v.friend_profile_user_profile.user_profile_nick_name}
            faceUrl={v.friend_profile_user_profile.user_profile_face_url}
            depName={v.friend_profile_add_source}
            onRefresh={retry}
          />
        ))}
      </div>
    </div>
  );
};
