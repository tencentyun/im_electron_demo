import { Select } from "tea-component";
import React, { useState } from "react";
import { modifyGroupInfo } from "../api";
import "./group-flag-message.scss";
import { useEffect } from "react";

const joinOptions = [
  { value: "2", text: "自由加入" },
  { value: "1", text: "需要验证" },
  { value: "0", text: "禁止加群" },
];

export const GroupJoinOption = (props: {
  joinOption: number;
  groupId: string;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { joinOption, groupId, onRefresh } = props;
  console.log('入群参数，', joinOption)
  const [join, setJoin] = useState(joinOption)

  useEffect(()=>{
    setJoin(joinOption)
  }, [joinOption])

  const handleChange = async (value: number) => {
    try {
      setJoin(value)
      await modifyGroupInfo({
        groupId,
        modifyParams: {
          group_modify_info_param_add_option: value,
        },
      });
      await onRefresh();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="group-flag-message">
      <div className="group-flag-message--title">
        <span className="group-flag-message--title__text">加群方式</span>
      </div>
      <Select
        size="full"
        type="simulate"
        appearance="button"
        className="group-flag-message--select"
        value={"" + join}
        onChange={(value) => handleChange(Number(value))}
        options={joinOptions}
      />
    </div>
  );
};
