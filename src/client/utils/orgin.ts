import axios from 'axios'
// const { userId,userSig } = useSelector((state: State.RootState) => state.loginUser);
import getHuaRunConfig from '../constants/index'
import { SDKAPPID } from '../constants/index'
const { TIM_BASE_URL }  = getHuaRunConfig
const Lead = ['ZONGSHAOJUN', 'MALIMIN', 'TIANYU', 'XUYUHUA9', 'CHENFANGYUN', 'LUOLING41', 'CHENGSHAOKAI']
// 获取全部部门
const getAlldepartment = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/dep_page?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${localStorage.getItem('uid')}&userSig =${localStorage.getItem('usersig')}&random=${parseInt((Math.random() * 100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

// 查询部门信息
const getDepartment = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/dep_info?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${localStorage.getItem('uid')}&userSig =${localStorage.getItem('usersig')}&random=${parseInt((Math.random() * 100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

// 模糊搜索所有群组
const getFuzzy = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/group_open_http_svc/seach_group_bylike?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${localStorage.getItem('uid')}&userSig =${localStorage.getItem('usersig')}&random=${parseInt((Math.random() * 100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

//筛选部门人员
const filterGetDepartment = (data, callback, userId) => {
        getDepartment(data).then(res => {
            try {
                if (res.status == 200) {
                    if (Lead.indexOf(userId) !== -1) {
                        callback(res.data.DepInfo)
                    } else {
                        if (res.data.DepInfo.StaffInfoList && res.data.DepInfo.StaffInfoList.length > 0) {
                            let filterData = res.data.DepInfo.StaffInfoList.filter(item => {
                                console.log(Lead.indexOf(item.Uid))
                                return Lead.indexOf(item.Uid) <= -1
                            })
                            res.data.DepInfo.StaffInfoList = filterData
                            callback(res.data.DepInfo)
                        } else {
                            callback(res.data.DepInfo)
                        }
                    }
                }
            } catch (error) {
                
            }
        })
}


// 新增职员
const saveStaff = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/add_staff?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${localStorage.getItem('uid')}&userSig =${localStorage.getItem('usersig')}&random=${parseInt((Math.random() * 100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}


// 根据部门搜索人员
const getDepAllStaff  = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/dep_all_staff?sdkappid=${SDKAPPID}&&contentType=json&&identifier=${localStorage.getItem('uid')}&userSig =${localStorage.getItem('usersig')}&random=${parseInt((Math.random()*100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}
// 前缀模糊查询职员列表
const getstAffPrefix = (data) => {
    return axios({
        url: `${TIM_BASE_URL}/v4/org_svc/staff_match?sdkappid=${SDKAPPID}&contentType=json&identifier=${localStorage.getItem('uid')}&userSig =${localStorage.getItem('usersig')}&random=${parseInt((Math.random() * 100000000).toString())}`,
        method: 'POST',
        data: data || {}
    })
}

// 前缀模糊查询职员列表
const getAccountsList = (pagesize, pageNumber) => {
    return axios({
        url: `${TIM_BASE_URL}/huarun/user/list?limit=${pagesize}&page=${pageNumber}`,
        method: 'GET',
        data: {
            limit: pagesize,
            page: pageNumber
        }
    })
}

const getAccountsAdd = (foucs, id) => {
    return axios({
        url: `${TIM_BASE_URL}/huarun/user/add`,
        method: 'POST',
        data: {
            foucs: foucs,
            _id: id,
            uid: window.localStorage.getItem('uid')
        }
    })
}

//筛选行领导模糊查询职员列表
const filterGetStAffPrefix = (data, callback, userId) => {
    getstAffPrefix(data).then(res => {
        let { ActionStatus, ErrorCode, ErrorInfo, StaffInfoList } = res.data
        if (ActionStatus == 'OK' && ErrorCode === 0) {
            if (Lead.indexOf(userId) !== -1) {
                callback(StaffInfoList)
            } else {
                if (StaffInfoList && StaffInfoList.length > 0) {
                    let filterData = StaffInfoList.filter(item => Lead.indexOf(item.Uid) <= -1)
                    callback(filterData)
                } else {
                    callback(StaffInfoList)
                }
            }
        } else {
            console.log(ErrorInfo)
        }
    })
}


//是否行领导
const isLead = ()=> {
    if(Lead.indexOf(window.localStorage.getItem('uid')) !== -1){
        return true
    }else{
        return false
    }
}
//是否行领导数据过滤
const filterisLead = (val)=> {
    if(Lead.indexOf(val) !== -1){
        return true
    }else{
        return false
    }
}

//行领导过滤
const filterArray = (array,type)=> {
    if(isLead) {
        let newarray = []
        for (let i = 0;i < array.length;i++) {
            if(type == 1){
                if(!filterisLead(array[i].friendship_friend_info_get_result_identifier)){
                    newarray.push(array[i])
                }
            }else if(type == 2){
                if(!filterisLead(array[i].conv_profile.user_profile_identifier)){
                    newarray.push(array[i])
                }
            }
        }
        return newarray
    }else{
        return array
    }
}

// 格式化数据
const assemblyData = (data, childrenNode, itemChildren, labelNode, restLabel) => {
    let result = []
    let queue = data
    while (queue.length > 0) {
        [...queue].forEach((child, i) => {
            queue.shift()
            child.DEPT_NAME = child[labelNode] == "" ? "" : child[labelNode].match(/[^\/]+/)[0]
            child.key = 'BM' + child.DepId
            child.title = child[labelNode] == "" ? "" : child[labelNode].match(/[^\/]+/)[0]
            child.children = []
            if (Array.isArray(child[itemChildren]) && child[itemChildren].length > 0) {
                for (let i = 0;i < child[itemChildren].length;i++) {
                    child[itemChildren][i].DEPT_NAME = child[itemChildren][i][restLabel]
                    child[itemChildren][i].UM_NUM = child[itemChildren][i].Uid
                    child[itemChildren][i].isLeaf = true
                    child[itemChildren][i].key = child[itemChildren][i].Uid
                    child[itemChildren][i].title = child[itemChildren][i][restLabel]
                    child.children.push(child[itemChildren][i])
                }
            }
            if (Array.isArray(child[childrenNode]) && child[childrenNode].length > 0) {
                for (let i = 0;i < child[childrenNode].length;i++) {
                    if (!(child[childrenNode][i].SubId.length > 0) && !(child[childrenNode][i].Uids.length > 0)) {
                        child[childrenNode][i].isLeaf = true
                    } else {
                        child[childrenNode][i].isLeaf = false
                    }
                    child[childrenNode][i].disableCheckbox = true
                    child[childrenNode][i].DEPT_NAME = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+/)[0]
                    child[childrenNode][i].key = 'BM' + child[childrenNode][i].DepId
                    child[childrenNode][i].title = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+/)[0]
                    child.children.push(child[childrenNode][i])
                }
            }
            result = result.concat([child])
            // child[childrenNode] && queue.push(...child[childrenNode])
        })
    }
    return result
}
const reportError = (data)=>{
    return axios({
        url: `${TIM_BASE_URL}/huarun/report`,
        method: 'POST',
        data: data
    })
}
export {
    filterArray,
    filterisLead,
    getAlldepartment,
    filterGetDepartment,
    getDepartment,
    assemblyData,
    getstAffPrefix,
    filterGetStAffPrefix,
    saveStaff,
    getAccountsList,
    getAccountsAdd,
    getDepAllStaff,
    isLead,
    reportError,
    getFuzzy
}