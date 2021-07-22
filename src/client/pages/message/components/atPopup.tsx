import './atPopup.scss'
import React, { 
    FC, 
    useEffect, 
    useRef, 
    useState 
} from "react"
import { Avatar } from "../../../components/avatar/avatar"
import { getSelectionCoords } from '../../../utils/getSelectionCoords';
import { List } from "tea-component"
import { getGroupMemberList } from "../api";

interface AtPopupProps {
    callback: Function,
    group_id: string
}

export const AtPopup: FC<AtPopupProps> = ({ callback, group_id }): JSX.Element => {
    const [list, setList] = useState([])
    const [coords, setCoords] = useState({x: 0, y: 0})
    const refPopup = useRef(null)
    const newCoords = getSelectionCoords(window)
    
    
    const getData = async () => {
        const list = await getGroupMemberList({
            groupId: group_id
        });
        const arr = list.group_get_memeber_info_list_result_info_array
        arr.unshift({
            group_member_info_identifier:'全体成员'
        })
        setList(arr)
    }
    useEffect(() => {
        setCoords({x: newCoords.x - 325, y: newCoords.y - 35})
        getData()
    }, [group_id])

    useEffect(() => {
        document.addEventListener('click', handlePopupClick);
        return () => {
            document.removeEventListener('click', handlePopupClick);
        }
    }, []);

    const handlePopupClick = (e) => {
        if(!refPopup.current) return
        if (!refPopup.current.contains(e.target as Node) && refPopup.current !== e.target) {
            callback("")
        } 
    }

    return (
        <div className="at-popup-wrapper" style={{left: coords.x, top: coords.y}}>
            <List ref={refPopup} className="at-popup" >
                {   
                    list.map((v, i) => <List.Item key={i} onClick={() => callback(v.group_member_info_identifier)}>    
                        <Avatar
                            size="mini"
                            userID = { v.group_member_info_identifier }
                        />
                        {v.group_member_info_identifier}
                    </List.Item>)
                }
            </List>
        </div>
    )
}