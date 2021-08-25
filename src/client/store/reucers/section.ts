import { GET_SECTION_COUNT,GET_My_GROUP_INFORMATION, GET_INIT_GROUP_INFO} from '../actions/section'

enum typeEnum {
    GET_SECTION_COUNT ='GET_SECTION_COUNT',
    GET_My_GROUP_INFORMATION = 'GET_My_GROUP_INFORMATION',
    GET_INIT_GROUP_INFO = "GET_INIT_GROUP_INFO"
  }

const initState = {
    section:[],
    mygroupInfor:{
      group_member_info_custom_info: [],
        group_member_info_face_url: "",
        group_member_info_group_id: "",
        group_member_info_identifier:"",
        group_member_info_member_role:null,
        group_member_info_msg_seq:"",
        group_member_info_msg_flag:null,
        group_member_info_name_card:"",
        group_member_info_nick_name:"",
        group_member_info_remark:null
    }
}

const sectionReducer = (state = initState, action: { type: typeEnum; payload: any }) => {
    const { type , payload } = action;
    switch (type) {
        case GET_SECTION_COUNT:
          return {
              ...state,
              section: payload
          }
        case GET_My_GROUP_INFORMATION:
            return {
              ...state,
              mygroupInfor: payload
          }
        case GET_INIT_GROUP_INFO:
            return {
              ...state,
              initGroupInfor: payload
          }
        default:
          return state;
        }
}

export default sectionReducer;