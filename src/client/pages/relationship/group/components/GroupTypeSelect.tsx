import { Select, SelectProps } from "tea-component"
import React from "react"

export const groupTypeOptions = [
    { value: "0" as const, text: "群聊" },
    // { value: "1" as const, text: "好友工作群" },
    // { value: "2" as const, text: "临时会议群" },
];

export const GroupTypeSelect = (props: SelectProps): JSX.Element => {
  const { value, onChange, ...others } = props
  return (
    <Select
      value={value}
      onChange={onChange}
      options={groupTypeOptions}
      {...others}
    />
  );
};
