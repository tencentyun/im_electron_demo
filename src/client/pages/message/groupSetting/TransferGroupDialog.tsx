import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { message, Modal } from "tea-component";
import React from "react";
import { modifyGroupInfo } from "../api";
import { TransferGroupForm, FormValue } from "./TransferGroupForm";
import { useSelector } from 'react-redux';

export interface TRansferGroupRecordsType {
  groupId: string;
}

export const TransferGroupDialog = (props: {
  userList: {
    user_profile_face_url: string;
    user_profile_nick_name: string;
    user_profile_identifier: string;
    group_member_info_member_role: number;
  }[];
  onSuccess?: () => void;
  dialogRef: DialogRef<TRansferGroupRecordsType>;
}): JSX.Element => {
  const { onSuccess, dialogRef, userList } = props;
  const { userId } = useSelector((state: State.RootState) => state.userInfo);
  const [visible, setShowState, defaultForm] = useDialog<TRansferGroupRecordsType>(
    dialogRef,
    {}
  );
  const onClose = () => setShowState(false);

  const onOk = async (formValue: FormValue) => {
    const { UID } = formValue;
    try {
      await modifyGroupInfo({
        groupId: defaultForm.groupId,
        modifyParams: {
          group_modify_info_param_owner: UID,
        },
      });
      message.success({ content: '转让成功' })
    } catch (e) {
      message.error({ content: '转让失败' + e })
    }
  };

  const success = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <Modal className="dialog" disableEscape size="s" caption="转让群主" visible={visible} onClose={onClose}>
      <Modal.Body>
        <TransferGroupForm userList={userList.filter(i=> i.user_profile_identifier!==userId)} onSubmit={onOk} onSuccess={success} />
      </Modal.Body>
    </Modal>
  );
};
