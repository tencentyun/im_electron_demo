import React from "react";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import { getFriendList } from "./api";
import { ListItem } from "./ListItem";
import "./friend-list.scss";
import { Table } from "tea-component";
import { isWin } from "../../../utils/tools";

const { scrollable } = Table.addons;

export const FriendList = () => {

  const height = window.innerHeight - 77 - (isWin() ? 30 : 0);

  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    return await getFriendList();
  }, []);

  const friendList = value || [];


  const columns = [
    {
      header: "",
      key: "friend",
      render: (record: any) => {
        return (
          <ListItem
          key={record.friend_profile_identifier}
          userId={record.friend_profile_identifier}
          userName={record.friend_profile_user_profile.user_profile_nick_name}
          faceUrl={record.friend_profile_user_profile.user_profile_face_url}
          depName={record.friend_profile_add_source}
          onRefresh={retry}
        />
        );
      },
    },
  ];

  return (
    <div className="friend-list">
      <div className="friend-list--title">
        <span className="friend-list--title__icon"></span>
        <span className="friend-list--title__text">好友列表</span>
      </div>
      <div className="friend-list--content">
      <Table
        hideHeader
        disableHoverHighlight
        className="friend-list--table"
        bordered={false}
        columns={columns}
        records={friendList}
        addons={[
          scrollable({
            virtualizedOptions: {
              height,
              itemHeight: 60,
              // onScrollBottom,
            },
          }),
        ]}
      />
      </div>
    
    </div>
  );
};
