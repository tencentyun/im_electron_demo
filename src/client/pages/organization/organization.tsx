import React, { useState } from "react";
import { TreeDynamicExample } from './tree/tree'
import { Informathion } from './information/information'
import { Search } from './search/search';
import { useDispatch, useSelector } from "react-redux";

import './organization.scss'
export const Organization = ({
    
}): JSX.Element => {
   const { section  } = useSelector((state: State.RootState) => state.section);
   if(section.length <= 0) section = JSON.parse(window.localStorage.getItem('section'));
   console.log("群组",section)
   const  [staff,setStaff] = useState({
         DEPT_NAME: section[0].DEPT_NAME,
         DepName:section[0].DepName
   });

   const [displayOc,setDisplayOc] = useState(false);
   const  refreshData = (refData: any)=> {
      console.log("点击触发",refData)
      setStaff(refData)
   }
   const  searchStaff = (refData,filterText)=> {
      console.log("搜索触发",refData)
      setDisplayOc(true)
      filterText && setDisplayOc(false)
      setStaff(refData)
   }
    return(
        <div className='organ'>
             <div className='tree'>
                <Search callback= {searchStaff} onClear = { ()=>setDisplayOc(false) }></Search>
               <div style={{display:displayOc ? 'none' : 'flex'}}>
                     <TreeDynamicExample  selectable={false} callback={refreshData}></TreeDynamicExample>
               </div>
             </div>
             <div className="informathion">
                <Informathion staffData={staff}></Informathion>
             </div>
        </div>
    )
}