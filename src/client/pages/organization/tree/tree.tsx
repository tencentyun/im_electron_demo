import React, { FC, useEffect, useState } from "react";
// import { Tree } from "tea-component";
import { Tree } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import {
    UsergroupAddOutlined,
    UserOutlined
} from '@ant-design/icons';
import { filterGetDepartment, isLead } from '../../../utils/orgin'

interface TreeDynamic {
    callback: Function
    personnel?: Function
    selectable?: boolean
    searchList?: Array<string>
    selectIdsProp?: Array<string>
}

interface DataNode {
    title: string;
    key: string;
    isLeaf?: boolean;
    children?: DataNode[];
}



const assemblyData = (data, childrenNode, itemChildren, labelNode, restLabel) => {
    let result = []
    let queue = data
    while (queue.length > 0) {
        ;[...queue].forEach((child, i) => {
            queue.shift()
            child.DEPT_NAME = child[labelNode] == "" ? "" : child[labelNode].match(/[^\/]+/)[0]
            child.key = 'BM' + child.DepId
            child.title = child[labelNode] == "" ? "" : child[labelNode].match(/[^\/]+/)[0]
            child.children = []
            child.icon = <UsergroupAddOutlined />
            if (Array.isArray(child[itemChildren]) && child[itemChildren].length > 0) {
                for (let i = 0;i < child[itemChildren].length;i++) {
                    child[itemChildren][i].DEPT_NAME = child[itemChildren][i][restLabel]
                    child[itemChildren][i].UM_NUM = child[itemChildren][i].Uid
                    child[itemChildren][i].isLeaf = true
                    child[itemChildren][i].key = child[itemChildren][i].Uid
                    child[itemChildren][i].title = child[itemChildren][i][restLabel]
                    child[itemChildren][i].icon = <UserOutlined style={{ color: '#2A86FF' }} />
                    child.children.push(child[itemChildren][i])
                }
            }
            if (Array.isArray(child[childrenNode]) && child[childrenNode].length > 0) {
                for (let i = 0;i < child[childrenNode].length;i++) {
                    if (!isLead()) {
                        if (child[childrenNode][i].DepName == '行领导' || child[childrenNode][i].DepId == "2") {
                            continue;
                        }
                    }
                    if (!(child[childrenNode][i].SubId.length > 0) && !(child[childrenNode][i].Uids.length > 0)) {
                        child[childrenNode][i].isLeaf = true
                    } else {
                        child[childrenNode][i].isLeaf = false
                    }
                    child[childrenNode][i].disableCheckbox = true
                    child[childrenNode][i].DEPT_NAME = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+/)[0]
                    child[childrenNode][i].key = 'BM' + child[childrenNode][i].DepId
                    child[childrenNode][i].title = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+/)[0]
                    child[childrenNode][i].icon = <UsergroupAddOutlined />
                    child.children.push(child[childrenNode][i])
                }
            }
            result = result.concat([child])
            // child[childrenNode] && queue.push(...child[childrenNode])
        })
    }
    return result
}

function getNode(nodes, id) {
    for (const node of nodes) {
        if (node.key === id) {
            return node;
        }
        if (node.children) {
            const result = getNode(node.children, id);
            if (result) {
                return result;
            }
        }
    }
    return null;
}


let personalList = []

export const TreeDynamicExample: FC<TreeDynamic> = ({ selectable = false, callback, personnel, selectIdsProp = [], searchList = [] }): JSX.Element => {
    const [selectIds, setSelectIds] = useState([]);

    useEffect(() => {
        if (selectable) {
            setSelectIds(selectIdsProp) 
            if (selectIdsProp.length >= personalList.length) {
                //添加
                personalList.push({ Uid: "---", stance: true })
            } else {
                //删除
                personalList = personalList.filter(item => selectIdsProp.indexOf(item.Uid) != -1)
            }
        }
    }, [selectIdsProp])



    const { section } = useSelector((state: State.RootState) => state.section);
    const [treeData, setTreeData] = useState(section.length ? section : JSON.parse(window.localStorage.getItem('section')));
    const activeNode = (value: Array<any>, node: any) => {
        callback(node)
        //    setSelectIds(value);
    }

    const recursiveRree = (treeData) => {
        treeData.forEach(node => {
            if (node.children) {
                //人员
                let nodeDisable = node.children.filter(item => item.disableCheckbox)
                console.log(nodeDisable, node.title)
                if (nodeDisable.length <= 0) {
                    node.disableCheckbox = false
                }
                const result = recursiveRree(node.children);
            }
        });
    }
    const filterStaff = (data: any) => {
        return data.filter(item => item.Uid)
    }

    const personal = (value: any, id: string | number) => {
        setSelectIds(selectIdsFormat(value));
        let reacrInfor = selectIdsFormat(value)
       console.log(reacrInfor)
        let selectId = Array.from(new Set(reacrInfor.concat(value)))
       
        personalList = []
        selectId.forEach(item => {
            personalList.push(getNode(treeData, item) ? getNode(treeData, item) : { Uid: "---", stance: true })
        })
        
        personnel && personnel(filterStaff(personalList))
    }

    const selectIdsFormat = (arrayList: Array<string>) => {
        let SarrayList = personalList.filter(item => !item.stance)
        let selectIdsProp = searchList.map(item => item.Uid)
        if (arrayList.length == 0) {
            return selectIdsProp.filter(item => SarrayList.map(items => items.Uid).indexOf(item) === -1)
        } else if (arrayList.length >= SarrayList.length) {
            return Array.from(new Set(selectIdsProp.concat(arrayList)))
        } else {
            return selectIdsProp.filter(function (val) { return SarrayList.map(item => item.Uid).filter(function (val) { return arrayList.indexOf(val) === -1 }).indexOf(val) === -1 })
        }
    }

    function updateTreeData(list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] {
        return list.map(node => {
            if (node.key === key) {
                return {
                    ...node,
                    children,
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: updateTreeData(node.children, key, children),
                };
            }
            return node;
        });
    }

    function onLoadData({ key, children }: any) {
        return new Promise<void>(resolve => {
            const node = getNode(treeData, key);
            if (node.DepId) {
                filterGetDepartment({
                    DepId: node.DepId
                }, (dataNode) => {
                    setTreeData(origin =>
                        updateTreeData(origin, key, assemblyData([dataNode], 'SubDepsInfoList', 'StaffInfoList', 'DepName', 'Uname')[0].children),
                    );
                    if (selectable) {
                        let Copy = updateTreeData(treeData, key, assemblyData([dataNode], 'SubDepsInfoList', 'StaffInfoList', 'DepName', 'Uname')[0].children)
                        recursiveRree(Copy)
                        recursiveRree(Copy)
                        setTreeData(Copy)
                    }
                    resolve();
                }, window.localStorage.getItem('uid'))
            } else {
                resolve();
                return;
            }
        });
    }



    return (
        <div>
            {
                <Tree
                    showIcon
                    checkable={selectable}
                    loadData={onLoadData}
                    defaultExpandAll
                    treeData={treeData}
                    checkedKeys={selectIds}
                    onCheck={(selectedKeys, selectedNodes) => {
                        console.log(selectedKeys, selectedNodes)
                        personal(selectedKeys, selectedNodes.node.key)
                    }}
                    onSelect={(selectedKeys, selectedNodes) => {
                        // personal(selectedKeys,selectedNodes.node.key)
                        activeNode(selectedKeys, selectedNodes.node)
                        console.log(selectedKeys, selectedNodes)
                    }}
                />
            }
        </div>
    )
}