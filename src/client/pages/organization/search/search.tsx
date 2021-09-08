import React, { FC, useEffect, useState } from "react";
import { SearchBox} from "tea-component";
import { getstAffPrefix, filterGetStAffPrefix } from '../../../utils/orgin'
import './search.scss'


interface TreeDynamic {
    callback?: Function
    handleCallback?:Function,
    onClear?:Function,
    filter?:boolean
}
export const Search : FC<TreeDynamic> = ({ callback,onClear,handleCallback,filter = true }): JSX.Element => {
    let  settime: any;
    const [filterDataIndex,setFilterDataIndex] = useState(0);
    const [filterData,setFilterData] = useState([]);
    const [filterText,setFilterText] = useState("");

    
    const 	searchRectData = (nameText) =>{
                clearTimeout(settime)
                settime = setTimeout(async ()=>{
                const { data } =  await	getstAffPrefix({ Math:nameText,Limit:100 })
                let { ActionStatus, ErrorCode, ErrorInfo,StaffInfoList } = data
                if(ActionStatus == 'OK' && ErrorCode === 0){
                    callback && ((StaffInfoList.length > 0) && callback(StaffInfoList[0]))
                        setFilterDataIndex(0)
                        console.log(StaffInfoList)
                        setFilterData(StaffInfoList)
                }else{
                   console.log(ErrorInfo)
                }
            },500)
    }

    const filterSearchRectData = (nameText) =>{
            clearTimeout(settime)
            if(nameText.trim() == "") onClear && onClear()
                settime = setTimeout(async ()=>{
                    filterGetStAffPrefix({ Math:nameText,Limit:100 },(filterLoda)=>{
                        callback && ((filterLoda.length > 0) && callback(filterLoda[0],filterText))
                        setFilterDataIndex(0)
                        setFilterData(filterLoda)
                    },window.localStorage.getItem('uid'))
        },500)
    }

    const  handleItemClick  = (data,index):void => {
        setFilterDataIndex(index)
        callback && callback(data)
        handleCallback && handleCallback(data)
    }
    return (
        <>
            <section className='section-search'>
                    <SearchBox
                    onSearch={console.log}
                    onChange={(value,context)=>{
                        setFilterText(value)
                        filter ? filterSearchRectData(value) :  searchRectData(value)
                    }}
                    onClear={() => {
                        onClear && onClear()
                    }}
                    onHelp={() => console.log("help")}
                    />

           
                {
                  filterText &&  (<div className="charon-filter-meber" >
                  {
                                filterData.map((item,index) => 
                                    <div  className={`charon-filter-meber-item ${filterDataIndex == index ? 'active' : "" }`} key={index} onClick={ ()=>{handleItemClick(item,index)} }>
                                        <div>
                                            { item.Uname}
                                        </div>
                                        <div className="charon-filter-meber-section">	
                                            { item.DepName }
                                        </div>
                                    </div>
                                )
                            }
                    </div>)
                }
                           
            
            </section>
        </>
    )
}