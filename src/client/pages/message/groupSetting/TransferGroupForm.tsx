import { SearchBox, Radio, Button } from "tea-component";
import React, { useState } from "react";
import "./tranfer-group-form.scss";
import { Avatar } from "../../../components/avatar/avatar";
import { throttle, highlightText } from "../../../utils/tools"
export interface FormValue {
  UID: string;
}

interface Props {
  userList: {
    group_member_info_face_url: string;
    group_member_info_nick_name: string;
    group_member_info_identifier: string;
  }[];
  onSubmit: (formValue: FormValue) => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
  onClose?: () => void;
}


export const TransferGroupForm = (props: Props): JSX.Element => {
  const { onSubmit, onSuccess, onError, userList } = props;
  const [selectedUserId, setSelectedUserId] = useState('')
  const [searchData, setSearchData] = useState(userList)
  const [searchText, setSearchText] = useState('')
  // eslint-disable-next-line
  const handlerSubmit = async () => {
    try {
      await onSubmit({
        UID: selectedUserId
      });
      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };
  const onSearch = throttle((value) => {
    setSearchText(value)
    let dataList = userList
    if (value) {
      dataList = dataList.filter(item => item.group_member_info_nick_name.includes(value) || item.group_member_info_identifier.includes(value))
    }
    setSearchData(dataList)
  }, 400)
  const onChange = (e) => {
    setSelectedUserId(e)
  }
  return (
    <div className="transfer-group">
        <section>
            <SearchBox placeholder="请输入转让人UID或者昵称" onChange={onSearch} onSearch={onSearch} onClear={() => onSearch('')} />
        </section>
        <Radio.Group
          className="group-nember-list"
          value={selectedUserId}
          onChange={onChange}
          layout="column"
        >
          {
             searchData.map((v, index) => (
               <Radio name={v.group_member_info_identifier}  key={v.group_member_info_face_url + index} display="block">
                <div className="group-member--avatar-box">
                  <Avatar
                    key={ v.group_member_info_face_url }
                    extralClass="transfer-group-avatar"
                    url={v.group_member_info_face_url}
                  />
                  <span className="group-member--name">
                    <span dangerouslySetInnerHTML={{ __html: highlightText(searchText, v.group_member_info_nick_name)}}></span>
                    <span dangerouslySetInnerHTML={{ __html: highlightText(searchText, v.group_member_info_identifier)}}></span>
                  </span>
                </div>
              </Radio>
            ))
          }
        </Radio.Group>
        <div className="transfer-footer">
          <Button type="primary" onClick={handlerSubmit} disabled={!selectedUserId}>确定</Button>
        </div>
    </div>
  );
};
