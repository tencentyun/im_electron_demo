import React, { useState } from "react";
import { Group } from "./group";
import "./relationship.scss";

const navList = [
  {
    id: "group",
    title: "我的群组",
  },
];

export const RelationShip = (): JSX.Element => {
  const [activedId, setActiveId] = useState("group");

  const DisplayComponent = {
    group: Group,
  }[activedId];

  const addActiveClass = (id: string): string =>
    id === activedId ? "is-active" : "";

  const handleLinkClick = (id: string): void => setActiveId(id);

  return (
    <div className="relationship">
      <div className="relationship-nav">
        <ul>
          {navList.map((v) => (
            <li
              className={`relationship-nav--item ${addActiveClass(v.id)}`}
              key={v.id}
              onClick={() => handleLinkClick(v.id)}
            >
              <span className={`relationship-nav--item__icon ${v.id}`} />
              <span className={`relationship-nav--item__name`}>{v.title}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relationship-content">
        <DisplayComponent />
      </div>
    </div>
  );
};
