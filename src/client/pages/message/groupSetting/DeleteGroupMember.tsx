import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Button, Icon, Input, Modal } from "tea-component";
import React, { FC, useState, useEffect } from "react";
import { debounce } from "lodash";
import { Avatar } from "../../../components/avatar/avatar";
import { deleteGroupMember } from "../api";

import './delete-group-member.scss';

const getId = (item) => {
  if (!item) return false;
  return item.user_profile_identifier;
};

interface UserItemProps {
  onItemClick: (id: string, item: any) => void;
  onRemove: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    id: string,
    item: any
  ) => void;
  item: any;
  seleted?: boolean;
  hasCloseIcon?: boolean;
  hasSelectedIcon?: boolean;
}

export const UserItem: FC<UserItemProps> = ({
  onItemClick,
  onRemove,
  seleted,
  item,
  hasCloseIcon,
  hasSelectedIcon,
}): JSX.Element => {
  const name = item?.user_profile_nick_name || "";
  const faceUrl = item?.user_profile_face_url || "";
  const id = item?.user_profile_identifier || "";
  return (
    <div onClick={() => onItemClick(id, item)} className="user-item">
      {hasSelectedIcon &&
        (seleted ? (
          <Icon className="user-item__icon" type="success" />
        ) : (
          <i className="user-item__icon-normal"></i>
        ))}
      <Avatar size="mini" url={faceUrl} nickName={name} userID={id} />
      <span>{name}</span>
      {hasCloseIcon && (
        <Icon type="dismiss" onClick={(e) => onRemove(e, id, item)} />
      )}
    </div>
  );
};

export interface DeleteMemberRecordsType {
  groupId: string;
  userList: any[];
}

export const DeleteGroupMemberDialog = (props: {
  onSuccess?: () => void;
  dialogRef: DialogRef<DeleteMemberRecordsType>;
}): JSX.Element => {
  const { onSuccess, dialogRef } = props;

  const [visible, setShowState, defaultForm] =
    useDialog<DeleteMemberRecordsType>(dialogRef, {
      userList: [],
      groupId: "",
    });

  const [userList, setUserList] = useState(defaultForm.userList);
  const [selectedList, setSelectedList] = useState([]);

  const filterUserList = (value: string) => {
    if (!value.length) {
      setUserList(defaultForm.userList);
      return;
    }
    const copyUserList = [...userList];
    const list = copyUserList.filter((v) =>
      v?.user_profile_nick_name?.includes(value)
    );
    setUserList(list || []);
  };

  const setValue = (value) => {
    filterUserList(value);
  };
  const handleInoputOnchange = debounce(setValue, 300);

  const onClose = () => setShowState(false);

  const handleItemClick = (conv_id, item) => {
    if (selectedList.findIndex((v) => getId(v) === conv_id) > -1) {
      const list = selectedList.filter((v) => getId(v) !== conv_id);
      setSelectedList(list);
    } else {
      selectedList.push(item);
      setSelectedList(Array.from(selectedList));
    }
  };
  const handleItemClose = (e, conv_id, item) => {
    e.stopPropagation();
    const list = selectedList.filter((v) => getId(v) !== conv_id);
    setSelectedList(list);
  };

  const onDelete = async () => {
    try {
      await deleteGroupMember({
        groupId: defaultForm.groupId,
        userIdList: selectedList.map((v) => v.user_profile_identifier),
      });
      setSelectedList([])
      onClose();
      onSuccess?.();
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    setUserList(defaultForm.userList);
  }, [defaultForm.userList]);

  return (
    <Modal
      className="forward-popup"
      visible={visible}
      caption="移除群成员"
      onClose={() => onClose()}
    >
      <Modal.Body>
        <div className="forward-popup__search-list">
          <div className="search-box">
            <Icon type="search" className="search-icon" />
            <Input
              type="search"
              className="search-input"
              placeholder="查找群成员"
              onChange={handleInoputOnchange}
            />
          </div>
          {/* <div className="forward-popup__search-list__search">
            <Icon className="forward-popup__search-list__icon" type="search" />
            <Input
              className="forward-popup__search-list__input"
              type="search"
              placeholder="查找群成员"
              onChange={handleInoputOnchange}
            />
          </div> */}
          <div className="forward-popup__search-list__list customize-scroll-style">
            {userList.map((v, k) => (
              <UserItem
                key={k}
                onItemClick={handleItemClick}
                onRemove={handleItemClose}
                seleted={
                  selectedList.findIndex((item) => getId(v) === getId(item)) >
                  -1
                }
                item={v}
                hasSelectedIcon
              />
            ))}
          </div>
        </div>
        <div className="forward-popup__seleted-list customize-scroll-style">
          {selectedList.map((v, k) => (
            <UserItem
              key={k}
              onItemClick={Function}
              onRemove={handleItemClose}
              item={v}
              hasCloseIcon
            />
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="primary"
          disabled={selectedList.length === 0}
          onClick={(e) => onDelete()}
        >
          移除
        </Button>
        <Button type="weak" onClick={() => onClose()}>
          取消
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
