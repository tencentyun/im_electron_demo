import React from "react";
import useAsyncRetryFunc from "../../../../utils/react-use/useAsyncRetryFunc";
import { getJoinedGroupList } from "../api";
import { GroupItem } from "./GroupItem";

import "./group-list.scss";

export const GroupList = (): JSX.Element => {
  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    return await getJoinedGroupList();
  }, []);

  console.log('value', value)

  return (
    <div className="group-list">
      {value?.map((v) => (
        <GroupItem
          key={v.group_base_info_group_id}
          groupId={v.group_base_info_group_id}
          groupAvatar={v.group_base_info_face_url}
          groupName={v.group_base_info_group_name}
          groupOwner={v.group_detial_info_owener_identifier}
          onRefresh={retry}
        />
      ))}
    </div>
  );
};
