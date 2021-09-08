import React, { useEffect, useState } from 'react';
import { ipcRenderer } from "electron";
import { Modal, Button } from 'tea-component';
import { useDialog } from "../../utils/react-use/useDialog";
import { EmptyResult } from '../../pages/message/searchMessage/EmptyResult';

// 未决消息列表
import { getPendencyList, handleGroupPendency, pendencyReaded } from '../../pages/relationship/group/api'
import './modelInform.scss'
import { formatDate } from '../../utils/tools'
import { Tag } from 'antd';

/**
* @brief 未决请求类型
*/
enum TIMGroupPendencyType {
    "请求加群",  // 请求加群
    "邀请加群",   // 邀请加群
    "邀请和请求的", // 
};

/**
* @brief 群未决处理状态
*/
enum TIMGroupPendencyHandle {
    "未处理",      // 未处理
    "他人处理",    // 他人处理
    "操作方处理", // 操作方处理
};

/**
* @brief 群未决处理操作类型
*/
enum TIMGroupPendencyHandleResult {
    "拒绝",  // 拒绝
    "同意",  // 同意
};

export const ModelInform = (props) => {

    const { dialogRef, callback } = props;
    const [visible, setShowState] = useDialog(dialogRef, {});
    const [pendency, setPendency] = useState<any>([])
    const onClose = () => setShowState(false);
    const procePend = async (data, pend: boolean) => {
        data.group_pendency_key = ""
        data.group_pendency_authentication = ""
        const penddata = await handleGroupPendency(pend, "", data)
        pendencyList()
        console.log("penddata_______+++", penddata)
    }
    const pendencyList = async () => {
        const { group_pendency_result_pendency_array, group_pendency_result_next_start_time, group_pendency_result_unread_num} = await getPendencyList()
        setPendency(group_pendency_result_pendency_array)
        callback(group_pendency_result_unread_num)
    }   
    useEffect(() => {
        pendencyList();
        ipcRenderer.on('updataGroupUnsettled', pendencyList)
        return function(){
          ipcRenderer.off('updataGroupUnsettled',pendencyList)
        }
    },[])

    useEffect(() => {
        visible && function (){ 
            pendencyReaded();
            pendencyList();
        }()
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
                <div className='pendency-title'>
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
                                    请求者<span className='pendency-item__span'>{item.group_pendency_form_identifier}</span>{TIMGroupPendencyType[item.group_pendency_pendency_type]}<span className='pendency-item__span'>{item.group_pendency_group_id}</span>群组
                                    <div style={{ marginBottom: '10px' }}>
                                        加入原因：{item.group_pendency_apply_invite_msg.trim() || "暂无"}
                                    </div>
                                    <div>
                                        <Tag color={item.group_pendency_handled == 0 ? "#f50" : '#87d068'}>{TIMGroupPendencyHandle[item.group_pendency_handled]}</Tag>
                                        {
                                            item.group_pendency_handled != 0 &&  <Tag color={item.group_pendency_handle_result == 0 ? "#f50" : '#87d068'}>{TIMGroupPendencyHandleResult[item.group_pendency_handle_result]}</Tag>
                                        }
                                    </div>
                                    {
                                        item.group_pendency_handled == 0 &&
                                        <div className='pendency-item__footer'>
                                            <Button type="primary" className='pendency-item__footer__btn' onClick={() => { procePend(item, true) }}>
                                                同意
                                            </Button>
                                            <Button type="error" onClick={() => procePend(item, false)}>
                                                拒绝
                                            </Button>
                                        </div>
                                    }
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