import axios from 'axios'
import { TIM_BASE_URL,SDKAPPID,UserID, UserSig} from '../config/config'
import { callbackify } from 'util';

const  Lead = ['ZONGSHAOJUN', 'MALIMIN', 'TIANYU', 'XUYUHUA9', 'CHENFANGYUN', 'LUOLING41', 'CHENGSHAOKAI']
// 获取全部部门
const getAlldepartment = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/dep_page?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${UserID}&userSig =${UserSig}&random=${parseInt((Math.random()*100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

// 查询部门信息
const getDepartment  = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/dep_info?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${UserID}&userSig =${UserSig}&random=${parseInt((Math.random()*100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

//筛选部门人员
const filterGetDepartment = (data, callback, userId) => {
    getDepartment(data).then(res =>{
        if(res.status == 200){
            if(Lead.indexOf(userId) !== -1){
                callback(res.data.DepInfo) 
            }else{
                if(res.data.DepInfo.StaffInfoList && res.data.DepInfo.StaffInfoList.length > 0){
                 let filterData =  res.data.DepInfo.StaffInfoList.filter(item => Lead.indexOf(item.Uid) !== -1)
                 res.data.DepInfo.StaffInfoList = filterData
                  callback(res.data.DepInfo)  
                }else{
                    callback(res.data.DepInfo) 
                }
            }
        }
    })
}


// 新增职员
const saveStaff  = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/add_staff?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${UserID}&userSig =${UserSig}&random=${parseInt((Math.random()*100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

// 前缀模糊查询职员列表
const getstAffPrefix = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/staff_prefix?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${UserID}&userSig =${UserSig}&random=${parseInt((Math.random()*100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

//筛选前缀模糊查询职员列表
const filterGetStAffPrefix = (data, callback, userId)=> {
    getstAffPrefix(data).then(res => {
        let { ActionStatus, ErrorCode, ErrorInfo,StaffInfoList } = res.data
        if(ActionStatus == 'OK' && ErrorCode === 0){
            if(Lead.indexOf(userId) !== -1){
                callback(StaffInfoList) 
            }else{
                if(StaffInfoList && StaffInfoList.length > 0){
                 let filterData =  StaffInfoList.filter(item => Lead.indexOf(item.Uid) !== -1)
                 callback(filterData)  
                }else{
                    callback(StaffInfoList) 
                }
            }
        }else{
            console.log(ErrorInfo)  
        }
    })
}
// 格式化数据
const  assemblyData = (data,childrenNode,itemChildren,labelNode,restLabel) =>{
    let result = []
    let queue = data
    while (queue.length > 0) {
        ;[...queue].forEach((child, i) => {
            queue.shift()
            child.DEPT_NAME = child[labelNode] == "" ? "" : child[labelNode].match(/[^\/]+$/)[0]
            child.id = child.DepId
            child.content = child[labelNode] == "" ? "" : child[labelNode].match(/[^\/]+$/)[0]
            child.children = []
            if(Array.isArray(child[childrenNode]) && child[childrenNode].length > 0){
                for(let i = 0;i <child[childrenNode].length;i++){
                        if(!(child[childrenNode][i].SubId.length > 0)  && !(child[childrenNode][i].Uids.length > 0)){
                            child[childrenNode][i].expandable = false
                        }else{
                            child[childrenNode][i].expandable = true
                        }
                        child[childrenNode][i].DEPT_NAME = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+$/)[0]
                        child[childrenNode][i].id = child[childrenNode][i].DepId
                        child[childrenNode][i].content = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+$/)[0]
                        child.children.push(child[childrenNode][i])
                }
            }
            if(Array.isArray(child[itemChildren]) && child[itemChildren].length > 0){
                for(let i = 0;i <child[itemChildren].length;i++){
                        child[itemChildren][i].DEPT_NAME = child[itemChildren][i][restLabel]
                        child[itemChildren][i].UM_NUM = child[itemChildren][i].Uid
                        child[itemChildren][i].id = child[itemChildren][i].Uid
                        child[itemChildren][i].content = child[itemChildren][i][restLabel]
                        child.children.push(child[itemChildren][i])
                }
            }	
            result = result.concat([child])
            // child[childrenNode] && queue.push(...child[childrenNode])
        })
        }
    return result 
}
export {
    getAlldepartment,
    filterGetDepartment,
    getDepartment,
    assemblyData,
    getstAffPrefix,
    filterGetStAffPrefix,
    saveStaff
}