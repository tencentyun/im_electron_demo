import React, { useState } from "react";
import { BuddyApply } from "./buddy-apply";
import { BuddyList } from "./buddy-list";
import { Group } from "./group";
import "./relationship.scss";

const navList = [
  {
    id: 'buddy-list',
    title: '好友列表'
  },
  {
    id: 'buddy-apply',
    title: '好友申请',
  },
  {
    id: "group",
    title: "我的群组",
  },
];

export const RelationShip = (): JSX.Element => {
  const [activedId, setActiveId] = useState("buddy-list");

  const DisplayComponent = {
    group: Group,
    'buddy-apply': BuddyApply,
    'buddy-list': BuddyList
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
