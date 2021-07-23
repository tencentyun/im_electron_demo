import React, { useState } from "react";
import { TreeDynamicExample } from './tree/tree'
import { Informathion } from './information/information'
import { Search } from './search/search';
import { useDispatch, useSelector } from "react-redux";
import './organization.scss'
export const Organization = ( props :{
    
}): JSX.Element => {
   const { section  } = useSelector((state: State.RootState) => state.section);
   console.log("群组",section[0])
   const  [staff,setStaff] = useState({
         DEPT_NAME: section[0].DEPT_NAME,
         DepName:section[0].DepName
   });
   const  refreshData = (refData: any)=> {
      console.log("点击触发",refData)
      setStaff(refData)
   }
   const  searchStaff = (refData)=> {
      console.log("搜索触发",refData)
      setStaff(refData)
   }
    return(
        <div className='organ'>
             <div className='tree'>
                <Search callback= {searchStaff}></Search>
                <TreeDynamicExample selectable={false} callback={refreshData}></TreeDynamicExample>
             </div>
             <div className="informathion">
                <Informathion staffData={staff}></Informathion>
             </div>
        </div>
    )
}