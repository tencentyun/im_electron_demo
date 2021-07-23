import React, { FC, useEffect, useState } from "react";
import { Tree } from "tea-component";
import { useDispatch, useSelector } from "react-redux";
import {filterGetDepartment, assemblyData} from '../../../utils/orgin'

interface TreeDynamic {
    callback: Function,
    personnel?:Function,
    selectable?: boolean,
    selectIdsProp?:Array<string>
}

function getNode(nodes, id) {
    for (const node of nodes) {
        if (node.id === id) {
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
   
    console.log("获取部门信息", section)
    const [data, setData] = useState(section);
    const emptyList = ()=>{
        if(section.length<= 0){
            setData(JSON.parse(window.localStorage.getItem('section')))
        }
    }
    emptyList()

    const activeNode = (value: Array<string>,id :string)=>{
       let nodeData = getNode(data, id)
       callback(nodeData)
    //    setSelectIds(value);
    }

    const filterStaff = (data: any)=>{
       return data.filter(item => item.Uid)
    }

    const personal = (value: Array<string>,id :string)=>{
        setSelectIds(value);
        let personalList = []
        value.forEach(item => {
            personalList.push(getNode(data, item) ? getNode(data, item) : {Uid:"---",stance:true})
        })
        personnel(filterStaff(personalList)) 
    }
    
    const onLoad = (id: string) => {
        return new Promise<void>((resolve, reject) => {
            const node = getNode(data, id);
            console.log(node)
            if(node.DepId){
                filterGetDepartment({
                    DepId:node.DepId
                },(dataNode)=>{
                    console.log(dataNode)
                        Object.assign(node, {
                            children:  assemblyData([dataNode],'SubDepsInfoList','StaffInfoList','DepName','Uname')[0].children
                          });
                        console.log(assemblyData([dataNode],'SubDepsInfoList','StaffInfoList','DepName','Uname')[0].children)
                        setData([...data]);
                        resolve();
                    
                },window.localStorage.getItem('uid'))
                // getDepartment({
                //     DepId:node.DepId
                // }).then(consoSection => {
                //     if(consoSection.status == 200){
                //         Object.assign(node, {
                //             children:  assemblyData([consoSection.data.DepInfo],'SubDepsInfoList','StaffInfoList','DepName','Uname')[0].children
                //           });
                //         console.log(assemblyData([consoSection.data.DepInfo],'SubDepsInfoList','StaffInfoList','DepName','Uname')[0].children)
                //         setData([...data]);
                //         resolve();
                //     }
                // })
            }else{
                resolve();
                return;
            }
        });
    }



    return (
        <div>
            <Tree
                activable={!selectable}
                selectable={selectable}
                data={data}
                onLoad={onLoad}
                onLoadError={(id, err) => console.warn(id, err)}
                selectedIds={selectIds}
                onSelect={(value, context) => {
                    console.log(value, context);
                    personal(value,context.nodeId)
                }}
                onActive={(value, context) => {
                    activeNode(value,context.nodeId)
                }}
            />
        </div>
    )
}