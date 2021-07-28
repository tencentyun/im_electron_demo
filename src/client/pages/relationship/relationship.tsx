import React, { useState } from "react";
import { FriendApply } from "./friend-apply";
import { FriendList } from "./friend-list";
import { Group } from "./group";
import { Organization } from '../organization/organization'
import { Accouts } from './accouts'
import "./relationship.scss";

const navList = [
  {
    id: "buddy-list",
    title: "好友列表",
  },
  {
    id: "buddy-apply",
    title: "好友申请",
  },
  {
    id: "group",
    title: "我的群组",
  },
  {
    id: "organization",
    title: "组织架构",
  },
  {
    id: "accounts",
    title: "公众号",
  }
];

export const RelationShip = (): JSX.Element => {
  const [activedId, setActiveId] = useState("group");
  const [onlyFilled,setOnlyFilled] = useState(true)
  // const DisplayComponent = {
  //   group: Group,
  // }[activedId];

  const addActiveClass = (id: string): string =>
    id === activedId ? "is-active" : "";

  const handleLinkClick = (id: string): void => {
    setActiveId(id)
    if(id == 'accounts'){
      setOnlyFilled(true)
    }
  };

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
      {
       activedId == 'group' ?   <Group /> : activedId == 'organization' ?  <Organization />  : <Accouts callBack={()=>{setOnlyFilled(false)}} onlyFill= { onlyFilled }/>
      }
      </div>
    </div>
  );
};
