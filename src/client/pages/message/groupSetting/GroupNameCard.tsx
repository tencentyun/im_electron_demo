import { Input } from "@tencent/tea-component";
import React from "react";
import "./group-name-card.scss";

export const GroupNameCard = (props: { nameCard: string }): JSX.Element => {
  const { nameCard } = props;

  return (
    <div className="group-name-card">
      <div className="group-name-card--title">
        <span className="group-name-card--title__text">群名片</span>
      </div>
        <Input className="group-name-card--input" size="full" value={nameCard} />
    </div>
  );
};
