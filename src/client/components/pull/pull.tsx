import { DialogRef, useDialog } from "../../utils/react-use/useDialog";
import { Button, Icon, message, Modal } from "tea-component";
import { TreeDynamicExample } from '../../pages/organization/tree/tree'
import { Search } from '../../pages/organization/search/search';
import React, { FC, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "../../components/avatar/avatar";
import { inviteMemberGroup } from "../../pages/message/api";

import './pull.scss';

const getId = (item) => {
  if (!item) return false;
  return item.Uid;
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
  const name = item?.Uname || "";
  const faceUrl = item?.Url || "";
  const id = item?.Uid || "";
  return (
    <div onClick={() => onItemClick(id, item)} className="user-item">
      {hasSelectedIcon &&
        (seleted ? (
          <Icon className="user-item__icon" type="success" />
        ) : (
          <i className="user-item__icon-normal"></i>
        ))}
      <Avatar size="small" url={faceUrl} nickName={name} userID={id} />
      <span className='user-item-sapn'>{name}</span>
      {hasCloseIcon && (
        <Icon type="dismiss" onClick={(e) => onRemove(e, id, item)} />
      )}
    </div>
  );
};

export interface AddMemberRecordsType {
  groupId: string;
  userList: any[];
}

export const AddGroupMemberDialog = (props: {
  onSuccess?: Function;
  dialogRef: DialogRef<AddMemberRecordsType>;
}): JSX.Element => {
  const { onSuccess, dialogRef } = props;

  const [visible, setShowState, defaultForm] =
    useDialog<AddMemberRecordsType>(dialogRef, {
      userList: [],
      groupId: "",
    });

  const [userList, setUserList] = useState(defaultForm.userList);
  const [selectedList, setSelectedList] = useState([]);
  const [selectIdsProp,setSelectIdsProp] = useState([]);
  const [searchList,setSearchList] = useState([]);
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


  const onClose = () => {
    setShowState(false);
    setSelectedList([]);
    setSelectIdsProp([])
  }
  const handleItemClose = (e, conv_id, item) => {
    e.stopPropagation();
    const list = selectedList.filter((v) => getId(v) !== conv_id);
    const listmap = list.map(item => item.Uid)
    setSelectIdsProp(listmap)
    setSelectedList(list);
  };

  const onAdd = async () => {
    try {
        await inviteMemberGroup({
            groupId:defaultForm.groupId,
            UIDS: selectedList.map((v) => v.Uid)
        });
      onClose();
      onSuccess?.(selectedList.map((v) => v.Uid));
    } catch (e) {
      console.log(e.message);
    }
  };

 //const { section  } = useSelector((state: State.RootState) => state.section);

 const  searchStaff = (refData)=> {
    console.log("搜索触发",refData)
    if(rearrangement(selectedList,refData)){
        message.warning({
            content: "该成员已在待添加列表！",
        })
    }else{
        selectedList.push(refData)
        setSelectedList(JSON.parse(JSON.stringify(selectedList)))
        setSearchList(JSON.parse(JSON.stringify(selectedList)))
        const listmap = selectedList.map(item => item.Uid)
        setSelectIdsProp(listmap)
    }
 }

 interface  Rearrang {
     Uid:string;
 }
 const rearrangement = (data:Array<Rearrang>,itemdata:Rearrang):boolean => {
        return data.some(item => item.Uid == itemdata.Uid)
 }

 const  callbackPersonnel = (refData: any)=> {
    console.log("人员列表",refData)
    //填充人员
    for (const iterator of searchList) {
            for (let i= 0; i<refData.length; i++) {
                if(refData[i].stance){
                    refData[i] = iterator
                    break
                }
            }
    }
    setSelectedList(refData)
 }
 const  refreshData = (refData: any)=> {
    console.log("点击触发",refData)
 }

  useEffect(() => {
    setUserList(defaultForm.userList);
  }, [defaultForm.userList]);

  return (
    <Modal
      className="forward-popup"
      visible={visible}
      caption="添加群聊人员"
      onClose={() => onClose()}
    >
      <Modal.Body>
        <div className="forward-popup__search-list">
          <div className="forward-popup__search-list__list customize-scroll-style">
                <Search handleCallback= {searchStaff}></Search>
                <TreeDynamicExample  selectIdsProp={selectIdsProp}  personnel={callbackPersonnel} selectable={ true } callback={refreshData}></TreeDynamicExample>    
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
          onClick={(e) => onAdd()}
        >
          确定
        </Button>
        <Button type="weak" onClick={() => onClose()}>
          取消
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
