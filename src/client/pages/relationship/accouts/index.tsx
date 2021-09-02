import React, { FC, useState, useEffect, useCallback } from "react";
import { SearchBox, Button, message} from "tea-component";
import { getAccountsList, getAccountsAdd } from '../../../utils/orgin'
import './index.scss'

interface userInfor{
    username?:string
    desc?:string
    uid?:string
    headurl?:string
    disabed?:boolean
    _id?:string
}

interface listType{
        list:Array<userInfor>,
        callBack:Function
    }

interface InforItemInterface {
    accounts:userInfor
    callBack:Function
    rederBack:Function
} 

interface   SearchItem{
    dataList:Array<userInfor>
    intitData:Array<userInfor>
    callBack:Function
} 

const AccoutsItem:FC<listType> =  ({list,callBack}): JSX.Element => {
    const [filterDataIndex,setFilterDataIndex] = useState(-1);
    const  handleItemClick  = (data,index):void => {
        callBack(data)
        setFilterDataIndex(index)
    } 
    return(
        <>
         {      
              list  &&  list.map((item, index) => 
                    <div className={`accouts-item ${filterDataIndex == index ? 'active' : "" }`} key={index} onClick={ ()=>{handleItemClick(item,index)}}>
                    <div className='avent'>
                        {
                            item.headurl ?  <img src={item.headurl} alt="" /> : item.username ? item.username.substring(item.username.length-2,item.username.length):''
                        }
                    </div>
                    <div className=''>
                        <div className='item-text'>
                            {item.username}
                        </div>
                        <div className='item-cent'>
                                {item.desc}
                        </div>
                    </div>
                </div>
                )
         }
        </>
    )
}

const InforItem : FC<InforItemInterface> =  ({accounts,callBack,rederBack}): JSX.Element => {
    const fillStyle = { marginTop: "20px",flex:"1" };
    const addStyle= { marginTop: "20px",flex:"1" ,marginLeft:'10px' }
    const handleConvListClick = async (item )=>{
       let  { data }  =  await getAccountsAdd(1, item._id)
       let { ErrorCode, ActionStatus } = data
       if(ErrorCode == 0 && ActionStatus == "OK"){
            callBack(true)
       }else{
        message.error({
            content: "关注失败，请重试！",
          })
       }
    }
    const handleReder = async (item )=>{
        let  { data }  =  await getAccountsAdd(0, item._id)
        let { ErrorCode, ActionStatus } = data
        if(ErrorCode == 0 && ActionStatus == "OK"){
             rederBack(true)
        }else{
         message.error({
             content: "取消关注失败，请重试！",
           })
        }
     }
    
    return(
        <>
        {
            accounts._id &&  <div className='information'>
            <div className='contenter'>
                 <div className='contenter-body'>
                     <div className='carder-center'>
                     <div className="main-info">
                         <div className="mian-flex">
                             <p>{accounts.username || "暂无"}</p>
                             <p>{accounts.desc || "暂无"}</p>
                         </div>
                         <div className="circle-name">
                         {
                            accounts.headurl ?  <img src={accounts.headurl} alt="公众号头像" /> : accounts.username
                        }
                         </div>
                     </div>
                     <div>   
                             <div className="info-bar">
                                 <div className="info-key">名称</div><div className="info-val">{accounts.username || '暂无'}</div>
                             </div>
                             <div className="info-bar">
                                 <div className="info-key">描述</div><div className="info-val">{accounts.desc || '暂无'}</div>
                             </div>
    
                             <div className="info-bar">
                                 <div className="info-key">账号</div><div className="info-val">{accounts.uid || '暂无'}</div>
                             </div>
                             <div
                                 className="info-message"
                             >  
                                <Button type="pay" style={fillStyle} disabled={!accounts.disabed} onClick= { ()=> handleReder(accounts)}>
                                            取关
                                </Button>
                                 <Button type="primary" disabled={accounts.disabed} onClick={() => handleConvListClick(accounts)} style={addStyle}>
                                         关注
                                 </Button>
                              </div>
                     </div>
                 </div>
                     </div>
                 </div>
            </div>
        }   
        </>
    )
}

const Search : FC<SearchItem> =  ({intitData,dataList,callBack}): JSX.Element => {
    return(
        <section className='section-search'>
        <SearchBox
        onSearch={console.log}
        onChange={(value,context)=>{
            console.log(intitData)
            if(value.trim() == ""){
                callBack(intitData)
            }else{
                let reg =new RegExp(".*?"+value+ '.*');
                let filterData = intitData.filter(item => item.username.match(reg))
                callBack(filterData)
            }
        }}
        onClear={() => console.log("clear")}
        onHelp={() => console.log("help")}
        />
        </section>
    )
}

interface listOnly{
    onlyFill:boolean
    callBack:Function
}
export const Accouts:FC<listOnly> = ({onlyFill,callBack}): JSX.Element => {
    const [list,setList] = useState([])
    const [intitData,setIntitData] = useState([])
    // const [ItemData,setItemData] = useState()
    const [clickItem,setClickItem] = useState({})

    const mackDown = ()=>{
          clickItem.disabed = true
          setClickItem(clickItem)
          getAccountsListCen()
    }

    const readerBack = () => {
        clickItem.disabed = false
        setClickItem(clickItem)
        getAccountsListCen()
    }

    const searchForm = (data) => {
        setList(data)
    }
    const getAccountsListCen = async()=>{
        callBack()
       let {data} = await getAccountsList( 100000,1)
       let { ActionStatus,ErrorInfo,ErrorCode,Data,Total }  =  data;
       Data =  Data ? Data.filter(item =>  item.username != 'admin') : Data
       Data?.forEach(element => {
           if(element.uid && element.uid !== "" && element.username != 'admin'){
               let splitEle = element.uid.split(',')
               if(splitEle.indexOf(window.localStorage.getItem('uid')) !== -1){
                    //已关注
                    element.disabed = true
               }else{
                    //未关注
                    element.disabed = false
               }
           }
       });
       setIntitData(Data ? JSON.parse(JSON.stringify(Data)) :  [])
       setList(Data)
    }

    if(onlyFill){
        getAccountsListCen()
    }
   

    return (
        <div className='accouts-element'>
            <div className='accouts-left'>
                <Search  intitData={intitData} dataList = { list } callBack={ searchForm }></Search>
                <AccoutsItem  callBack={(data)=>{
                    setClickItem(data)
                }} list={list}></AccoutsItem>
            </div>
            <div className='accouts-right'>
                <InforItem accounts={ clickItem } rederBack={readerBack} callBack={mackDown}></InforItem>
            </div>
           
        </div>
    );
  };