import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'tea-component';
import { useDialog } from "../../utils/react-use/useDialog";
import { EmptyResult } from '../../pages/message/searchMessage/EmptyResult';

// 未决消息列表
import { getPendencyList, handleGroupPendency} from '../../pages/relationship/group/api'
import './modelInform.scss'
import { formatDate } from '../../utils/tools'
export const ModelInform = (props) => {

    const { dialogRef } = props;
    const [visible, setShowState] = useDialog(dialogRef, {});
    const [pendency, setPendency] = useState<any>([])
    const onClose = () => setShowState(false);
    const procePend = async (data, pend : boolean) => {
        const penddata = await handleGroupPendency(pend, "", data)
        pendencyList()
        console.log("penddata_______+++", penddata)
    }
    const pendencyList = async () => {
        const { group_pendency_result_pendency_array } = await getPendencyList()
        setPendency(group_pendency_result_pendency_array)
        console.log("useEffect", pendency)
    }

    useEffect(() => {
        pendencyList()
    }, [visible])
    return (
        <Modal
            className="search-message-modal"
            disableEscape
            visible={visible}
            size="85%"
            disableCloseIcon
        >
            <Modal.Body>
                <div  className='pendency-title'>
                    验证消息
                </div>
                {
                    pendency.length ? <div className='pendency-main'>
                        {
                            pendency.map(item => {
                                return (<div className='pendency-item'>
                                    <div className='pendency-item__item'>
                                        {formatDate(item.group_pendency_add_time)}
                                    </div>
                                        请求者<span className='pendency-item__span'>{item.group_pendency_form_identifier}</span>申请加入<span className='pendency-item__span'>{item.group_pendency_group_id}</span>群组
                                    <div>
                                        加入原因：{item.group_pendency_apply_invite_msg.trim() || "暂无"}
                                    </div>
                                    <div className='pendency-item__footer'>
                                        <Button type="primary" className='pendency-item__footer__btn' onClick={()=>{ procePend(item, true) }}>
                                            同意
                            </Button>
                                        <Button type="error"  onClick={()=>  procePend(item, false)}>
                                            拒绝
                            </Button>
                                    </div>
                                </div>)
                            })
                        }
                    </div> : <EmptyResult contentText="没有相关验证消息呦~" />
                }
                <Modal.Footer>
                    <Button type="weak" onClick={onClose} style={{ marginBottom: "20px" }}>
                        关闭
                        </Button>
                </Modal.Footer>
            </Modal.Body>
        </Modal>
    )
};