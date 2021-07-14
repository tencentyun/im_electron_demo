import React from 'react';

import { Modal } from '@tencent/tea-component';
import { useDialog } from "../../../utils/react-use/useDialog";
import { SearchMessage } from './SearchMessage';

export const SearchMessageModal = (props) => {

   const { dialogRef } = props;

  const [visible, setShowState] = useDialog(dialogRef, {});

  const onClose = () => setShowState(false);

    return (
        <Modal 
            className="search-message-modal" 
            disableEscape 
            visible={visible} 
            onClose={onClose} 
            size="85%"
            disableCloseIcon
        >
            <Modal.Body>
                <SearchMessage />
            </Modal.Body>
        </Modal>
    )
};