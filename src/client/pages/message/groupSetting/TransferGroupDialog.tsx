import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Modal } from "@tencent/tea-component";
import React from "react";
import { modifyGroupInfo } from "../api";
import { TransferGroupForm, FormValue } from "./TransferGroupForm";

export interface TRansferGroupRecordsType {
  groupId: string;
}

export const TransferGroupDialog = (props: {
  onSuccess?: () => void;
  dialogRef: DialogRef<TRansferGroupRecordsType>;
}): JSX.Element => {
  const { onSuccess, dialogRef } = props;

  const [visible, setShowState, defaultForm] = useDialog<TRansferGroupRecordsType>(
    dialogRef,
    {}
  );
  const onClose = () => setShowState(false);

  const onOk = async (formValue: FormValue) => {
    const { UID } = formValue;
    await modifyGroupInfo({
      groupId: defaultForm.groupId,
      modifyParams: {
        group_modify_info_param_owner: UID,
      },
    });
  };

  const success = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <Modal size="m" disableEscape visible={visible} onClose={onClose}>
      <Modal.Body>
        <TransferGroupForm onSubmit={onOk} onSuccess={success} />
      </Modal.Body>
    </Modal>
  );
};