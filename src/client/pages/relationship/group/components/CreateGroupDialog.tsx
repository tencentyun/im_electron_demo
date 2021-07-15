import { DialogRef, useDialog } from "../../../../utils/react-use/useDialog";
import { Modal } from "@tencent/tea-component";
import React from "react";
import { CreateGroupForm, FormValue } from "./CreateGroupForm";
import { createGroup } from "../api";

export const CreateGroupDialog = (props: {
  onSuccess?: () => void;
  dialogRef: DialogRef;
}): JSX.Element => {
  const { onSuccess, dialogRef } = props;

  const [visible, setShowState] = useDialog(dialogRef, {});

  const onClose = () => setShowState(false);

  const success = () => {
    onSuccess();
    onClose();
  };

  const onSubmit = async (formData: FormValue) => {
    await createGroup(formData);
  };

  return (
    <Modal className="dialog"  disableEscape visible={visible} onClose={onClose} caption="创建群聊">
      <Modal.Body>
        <CreateGroupForm onSubmit={onSubmit} onSuccess={success} onClose={onClose} />
      </Modal.Body>
    </Modal>
  );
};
