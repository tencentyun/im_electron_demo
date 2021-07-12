import React from "react";
import { GroupList } from "./components/GroupList";
import { Title } from "./components/Title";
import './index.scss';

export const Group = (): JSX.Element => {

  return (
    <div className="group">
      <Title />
     <GroupList />
    </div>
  );
};
