import { DialogRef, useDialog } from '../../../../utils/react-use/useDialog';
import { Modal, Button } from '@tencent/tea-component';
import React,{ useState } from 'react';


export const ExportAllDataModal = (props: {
  onSuccess?: (value: { [k: string]: any }) => void;
  dialogRef: DialogRef;
}): JSX.Element => {
const { onSuccess, dialogRef } = props;

const [
  visible,
  setShowState,
] = useDialog(dialogRef, {});

const [loading, setLoading] = useState(false);

const onClose = () => setShowState(false);

const onOk = async () => {};
return (
  <Modal disableEscape visible={visible} onClose={onClose}>
    <Modal.Body>
      <Modal.Message
        icon='infoblue'
        message=''
        description=''
      />
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={onClose}>取消</Button>
      <Button type='primary' onClick={onOk} loading={loading}>
        确认
      </Button>
    </Modal.Footer>
  </Modal>
);
};