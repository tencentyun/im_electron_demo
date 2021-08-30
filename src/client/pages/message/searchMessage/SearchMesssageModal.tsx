import React, { useEffect, useState } from 'react';

import { Modal } from 'tea-component';
import { getJoinedGroupList } from '../../relationship/group/api';
import { useDialog } from "../../../utils/react-use/useDialog";
import { SearchMessage } from './SearchMessage';

export const SearchMessageModal = (props) => {

  const { dialogRef } = props;

  const [visible, setShowState] = useDialog(dialogRef, {});

  const [myGroupId, setMyGroupId]  = useState([])
  const onClose = () => setShowState(false);

  const  myGroupIdFnc = async () =>{
        const  data = await getJoinedGroupList()
            if(data && data.length){
                let myGroupIndentifier = data.map(item => item?.group_detial_info_group_id)
                setMyGroupId(myGroupIndentifier)
            }else{
                setMyGroupId([])
            }
    }

  useEffect(()=> {
    if(visible){
        myGroupIdFnc()
    }
  },[visible])

    return (
        <Modal 
            className="search-message-modal" 
            disableEscape 
            visible={visible} 
            size="85%"
            disableCloseIcon
        >
            <Modal.Body>
                <SearchMessage myGroupId={myGroupId}  close={onClose}/>
            </Modal.Body>
        </Modal>
    )
};