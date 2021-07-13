import React from "react";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import { getGroupMemberList } from "../api";

export const GroupMember = (props: { groupId: string }): JSX.Element => {
  const { groupId } = props;
  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    return await getGroupMemberList({ groupId });
  }, [groupId]);
  return <div>GroupMember</div>;
};
