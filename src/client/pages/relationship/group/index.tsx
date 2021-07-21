import React from "react";
import { LoadingContainer } from "../../../components/loadingContainer";
import useAsyncRetryFunc from "../../../utils/react-use/useAsyncRetryFunc";
import { getJoinedGroupList } from "./api";
import { GroupList } from "./components/GroupList";
import { Title } from "./components/Title";
import "./index.scss";

export const Group = (): JSX.Element => {
  const { value, loading, retry } = useAsyncRetryFunc(async () => {
    return await getJoinedGroupList();
  }, []);

  return (
    <LoadingContainer loading={loading}>
      <div className="group">
        <Title onRefresh={retry} />
        <GroupList value={value} onRefresh={retry} />
      </div>
    </LoadingContainer>
  );
};
