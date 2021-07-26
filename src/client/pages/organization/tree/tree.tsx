import React, { FC, useEffect, useState } from "react";
// import { Tree } from "tea-component";
import { Tree } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import {
    UsergroupAddOutlined,
    UserOutlined
  } from '@ant-design/icons';
import {filterGetDepartment} from '../../../utils/orgin'

interface TreeDynamic {
    callback: Function,
    personnel?:Function,
    selectable?: boolean,
    selectIdsProp?:Array<string>
}

interface DataNode {
    title: string;
    key: string;
    isLeaf?: boolean;
    children?: DataNode[];
  }

  const  assemblyData = (data,childrenNode,itemChildren,labelNode,restLabel) =>{
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
            if(Array.isArray(child[childrenNode]) && child[childrenNode].length > 0){
                for(let i = 0;i <child[childrenNode].length;i++){
                        if(!(child[childrenNode][i].SubId.length > 0)  && !(child[childrenNode][i].Uids.length > 0)){
                            child[childrenNode][i].isLeaf = true
                        }else{
                            child[childrenNode][i].isLeaf = false
                        }
                        child[childrenNode][i].DEPT_NAME = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+/)[0]
                        child[childrenNode][i].key = 'BM' + child[childrenNode][i].DepId
                        child[childrenNode][i].title = child[childrenNode][i][labelNode] == "" ? "" : child[childrenNode][i][labelNode].match(/[^\/]+/)[0]
                        child[childrenNode][i].icon = <UsergroupAddOutlined />
                        child.children.push(child[childrenNode][i])
                        
                }  
            }
            if(Array.isArray(child[itemChildren]) && child[itemChildren].length > 0){
                for(let i = 0;i <child[itemChildren].length;i++){
                        child[itemChildren][i].DEPT_NAME = child[itemChildren][i][restLabel]
                        child[itemChildren][i].UM_NUM = child[itemChildren][i].Uid
                        child[itemChildren][i].isLeaf = true
                        child[itemChildren][i].key = child[itemChildren][i].Uid
                        child[itemChildren][i].title = child[itemChildren][i][restLabel]
                        child[itemChildren][i].icon =  <UserOutlined style={{ color: '#2A86FF' }}/>
                        child.children.push(child[itemChildren][i])
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


export const TreeDynamicExample: FC<TreeDynamic> = ({selectable =  false,callback,personnel,selectIdsProp = []}): JSX.Element => {
    const [selectIds, setSelectIds] = useState([]);
    useEffect(() => {
        if(selectable) {
            setSelectIds(selectIdsProp) 
        }
    },[selectIdsProp])

    

    const { section } = useSelector((state: State.RootState) => state.section);
    const [treeData, setTreeData] = useState(section ? section : JSON.parse(window.localStorage.getItem('section')));
   
    const activeNode = (value: Array<any>,node :any)=>{
       callback(node)
    //    setSelectIds(value);
    }

    const filterStaff = (data: any)=>{
       return data.filter(item => item.Uid)
    }

    const personal = (value: any,id :string | number)=>{
        let selectId = Array.from(new Set(selectIds.concat(value)))
        setSelectIds(selectId);
        let personalList = []
        selectId.forEach(item => {
            personalList.push(getNode(treeData, item) ? getNode(treeData, item) : {Uid:"---",stance:true})
        })
        personnel && personnel(filterStaff(personalList))  
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
          if(node.DepId){
            filterGetDepartment({
                DepId:node.DepId
            },(dataNode)=>{
                console.log(dataNode)
                setTreeData(origin =>
                    updateTreeData(origin, key, assemblyData([dataNode],'SubDepsInfoList','StaffInfoList','DepName','Uname')[0].children),
                  );
                resolve();
            },window.localStorage.getItem('uid'))
        }else{
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
                treeData={treeData} 
                checkedKeys={selectIds}
                onCheck={(selectedKeys,selectedNodes)=>{
                    console.log(selectedKeys,selectedNodes)
                    personal(selectedKeys,selectedNodes.node.key)
                }}
                onSelect={(selectedKeys,selectedNodes)=>{
                    // personal(selectedKeys,selectedNodes.node.key)
                    activeNode(selectedKeys,selectedNodes.node)
                    console.log(selectedKeys,selectedNodes)
                }}
                />
            }
        </div>
    )
}