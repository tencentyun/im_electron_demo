import { DialogRef, useDialog } from "../../../../utils/react-use/useDialog";
import { Modal } from "tea-component";
import React from "react";
import { CreateGroupForm, FormValue } from "./CreateGroupForm";
import { createGroup } from "../api";
import { sendMsg } from "../../../../pages/message/api";

export interface CreateGroupRecordType {
  userId: string;
}

export const CreateGroupDialog = (props: {
  onSuccess?: () => void;
  dialogRef: DialogRef<CreateGroupRecordType>;
}): JSX.Element => {
  const { onSuccess, dialogRef } = props;

  const [visible, setShowState, defaultForm] = useDialog<CreateGroupRecordType>(
    dialogRef,
    {}
  );

  const onClose = () => setShowState(false);

  const success = () => {
    onSuccess();
    onClose();
  };

  const onSubmit = async (formData: FormValue) => {
    const res = await createGroup(formData);
    const currentGroupId = JSON.parse(res.json_param).create_group_result_groupid;
    await sendMsg({
      convId: currentGroupId,
      convType: 2,
      messageElementArray: [
        {
          elem_type: 900,
          custom_elem_data: defaultForm.userId.toString(),
        },
      ],
      userId: defaultForm.userId,
    });
  };

  return (
    <Modal
      className="dialog"
      disableEscape
      visible={visible}
      onClose={onClose}
      caption="创建群聊"
    >
      <Modal.Body>
        <CreateGroupForm
          onSubmit={onSubmit}
          onSuccess={success}
          onClose={onClose}
        />
      </Modal.Body>
    </Modal>
  );
};