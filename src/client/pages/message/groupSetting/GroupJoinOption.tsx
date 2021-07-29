import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "tea-component";
import { modifyGroupInfo, getConversionList } from "../api";
import { updateConversationList, updateCurrentSelectedConversation } from "../../../store/actions/conversation";
import "./group-flag-message.scss";

const joinOptions = [
  { value: "2", text: "自由加入" },
  { value: "1", text: "需要验证" },
  { value: "0", text: "禁止加群" }
];

export const GroupJoinOption = (props: {
  joinOption: number;
  groupId: string;
  userIdentity: number;
  onRefresh: () => Promise<any>;
}): JSX.Element => {
  const { joinOption, groupId, userIdentity, onRefresh } = props;
  const [join, setJoin] = useState(joinOption)
  const canEdit = [2, 3].includes(userIdentity);
  const dispatch = useDispatch();

  useEffect(()=>{ setJoin(joinOption) }, [joinOption])

  const { currentSelectedConversation } = useSelector(
    (state: State.RootState) => state.conversation
  );
  const updateConversation = async () => {
    const response = await getConversionList();
    dispatch(updateConversationList(response));
    if (response.length) {
      const currentConversationItem = response.find(
        (v) => v.conv_id === currentSelectedConversation.conv_id
      );
      if (currentConversationItem) {
        dispatch(updateCurrentSelectedConversation(currentConversationItem));
      }
    }
  };

  const handleChange = async (value: number) => {
    try {
      setJoin(value)
      await modifyGroupInfo({
        groupId,
        modifyParams: {
          group_modify_info_param_add_option: value,
        },
      });
      await updateConversation();
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
        disabled={!canEdit}
        className="group-flag-message--select"
        value={"" + join}
        onChange={(value) => handleChange(Number(value))}
        options={joinOptions}
      />
    </div>
  );
};
