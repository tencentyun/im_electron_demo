import { Input } from "@tencent/tea-component";
import React, { useEffect, useState } from "react";
import "./group-name-card.scss";

export const GroupNameCard = (props: { nameCard: string }): JSX.Element => {
  const { nameCard } = props;

  const [input, setInput] = useState(nameCard);

  const handleModify = () => {
    console.log("GroupNameCard", input);
  };

  useEffect(() => {
    setInput(nameCard);
  }, [nameCard]);

  return (
    <div className="group-name-card">
      <div className="group-name-card--title">
        <span className="group-name-card--title__text">群名片</span>
      </div>
      <Input
        className="group-name-card--input"
        size="full"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onKeyDown={(e) => {
          if (e.which === 13) {
            handleModify();
          }
        }}
      />
    </div>
  );
};
