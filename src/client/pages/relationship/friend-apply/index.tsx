import React, { useEffect, useMemo } from "react";
import { ListItem } from "./ListItem";
import { useAsyncFn } from "../../../utils/react-use/useAsyncFun";
import { getFriendShipPendencyList } from "./api";
import "./friend-apply.scss";

export const FriendApply = () => {
  const [state, fetchList] = useAsyncFn(async () => {
    return await getFriendShipPendencyList({ startSeq: 0, startTime: 0 });
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const startSeq = useMemo(() => {
    return state.value?.pendency_page_current_seq || 0;
  }, [state.value?.pendency_page_current_seq]);

  const applyList = useMemo(() => {
    return state.value?.applyList || [];
  }, [state.value?.applyList]);

  return (
    <div className="friend-apply">
      <div className="friend-apply--title">
        <span className="friend-apply--title__icon"></span>
        <span className="friend-apply--title__text">好友申请</span>
      </div>
      <div className="friend-apply--list">
        {applyList.map((v) => (
          <ListItem
            key={v?.user_profile_identifier}
            userId={v?.user_profile_identifier}
            faceUrl={v.user_profile_face_url}
            userName={v.user_profile_nick_name}
            depName={v.friend_add_pendency_info_add_source}
            onRefresh={fetchList}
          />
        ))}
      </div>
    </div>
  );
};
