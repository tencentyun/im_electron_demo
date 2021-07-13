import React, { useState } from "react";
import "./group-tool-bar.scss";

export const GroupToolBar = (props: { groupId: string }): JSX.Element => {
  const { groupId } = props;
  const [active, setActive] = useState("");

  const addActiveClass = (id: string): string =>
    active === id ? "is-active" : "";

  return (
    <div className="tool-bar">
      <div
        className="tool-bar--item"
        onClick={() => {
          setActive("query-message");
        }}
      >
        <span
          className={`tool-bar--item__icon query-message ${addActiveClass(
            "query-message"
          )}`}
        ></span>
      </div>
      <div
        className="tool-bar--item"
        onClick={() => {
          setActive("announcement");
        }}
      >
        <span
          className={`tool-bar--item__icon announcement ${addActiveClass(
            "announcement"
          )}`}
        ></span>
      </div>
      <div
        className="tool-bar--item"
        onClick={() => {
          setActive("setting");
        }}
      >
        <span
          className={`tool-bar--item__icon setting ${addActiveClass(
            "setting"
          )}`}
        ></span>
      </div>
    </div>
  );
};
