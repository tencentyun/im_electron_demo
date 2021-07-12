import React from "react";
import useAsyncRetryFunc from "../../../utils/useAsyncRetryFunc";
import { getJoinedGroupLis } from "./api";
import { GroupItem } from "./components/GroupItem";
import { Title } from "./components/Title";
import './index.scss';

export const Group = (): JSX.Element => {
  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    return await getJoinedGroupLis();
  }, []);

  return (
    <div className="group">
      <Title />
      <div className="group-list">
      {value?.map((v) => (
        <GroupItem
          groupId={v.group_base_info_group_id}
          groupAvatar={v.group_base_info_face_url}
          groupName={v.group_base_info_group_name}
        />
      ))}
      </div>
     
    </div>
  );
};
