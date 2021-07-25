import React, { FC, useEffect, useState } from "react";
import './information.scss'
import { useDispatch, useSelector } from "react-redux";
import { Button  } from "tea-component"
import { getUserInfoList } from '../../../pages/message/api'
import { changeFunctionTab } from '../../../store/actions/ui';
import { useMessageDirect } from "../../../utils/react-use/useDirectMsgPage";
interface Traffic {
    DEPT_NAME:string;
    DepName:string;
    Phone?:string;
    Email?:string;
    Title?:string;
    Uid?:string;
    Uname?:string;
}

interface Props{
    staffData:Traffic;
}

export const Informathion = (props: Props): JSX.Element => {
    // const { staffData }  = props;
    const  { staffData} = Object.assign({}, props);
    console.log(staffData)
    const dispatch = useDispatch();
    const fillStyle = { width: '100%' };
    const directToMsgPage = useMessageDirect();
    const handleConvListClick = async function (data){
        let convInfo = await getUserInfoList([data]) 
        dispatch(changeFunctionTab('message'))
        directToMsgPage({
            convType: 1,
            profile:convInfo[0],
        });
    }

    return (
        <div className='information'>
           <div className='contenter'>
                <div className='contenter-body'>
                    <div className='carder-center'>
                    <div className="main-info">
						<div className="mian-flex">
							<p>{staffData.DEPT_NAME ? staffData.DEPT_NAME : staffData.Uname}</p>
							<p>{staffData.DepName == "" ? "" : staffData.DepName.match(/[^\/]+$/)[0]}</p>
						</div>
						<div className="circle-name">{staffData.DEPT_NAME ? staffData.DEPT_NAME : staffData.Uname}</div>
					</div>

				{
                    staffData.Uid && 
                    <div>   
                            <div className="info-bar">
                                <span className="info-key">账号</span><span className="info-val">{staffData.Uid || '暂无'}</span>
                            </div>
                            <div className="info-bar">
                                <span className="info-key">手机</span><span className="info-val">{staffData.Phone || '暂无'}</span>
                            </div>

                            <div className="info-bar">
                                <span className="info-key">邮箱</span><span className="info-val">{staffData.Email || '暂无'}</span>
                            </div>

                            <div className="info-bar">
                                <span className="info-key">部门</span><span className="info-val">{staffData.DepName || '暂无'}</span>
                            </div>
                            <div className="info-bar">
                                <span className="info-key">职位</span><span className="info-val">{staffData.Title || '暂无'}</span>
                            </div>
                            <div className="info-bar">
                            </div>
                            <div
                                className="info-message"
                            >
                                <Button type="primary" onClick={() => handleConvListClick(staffData.Uid)} style={fillStyle}>
                                        发消息
                                </Button>
                             </div>
                    </div>
                }
				</div>
                    </div>
                </div>
           </div>
    )
}