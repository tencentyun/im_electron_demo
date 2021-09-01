import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Item, contextMenu, theme, animation } from "react-contexify";
import "./message-view.scss";
import {
  revokeMsg,
  deleteMsg,
  sendMsg,
  getLoginUserID,
  sendMergeMsg,
  getMsgList,
  deleteMsgList,
  sendForwardMessage,
} from "./api";
import {
  markeMessageAsRevoke,
  deleteMessage,
  reciMessage,
  addMoreMessage,
  updateMessages,
} from "../../store/actions/message";
import { ConvItem, ForwardType } from "./type";
import {
  getMessageId,
  getConvId,
  getConvType,
  getMergeMessageTitle,
  getMergeMessageAbstactArray,
  matchUrl,
} from "../../utils/messageUtils";
import { Avatar } from "../../components/avatar/avatar";
import TextElemItem from "./messageElemTyps/textElemItem";
import PicElemItem from "./messageElemTyps/picElemItem";
import CustomElem from "./messageElemTyps/customElem";
import VoiceElem from "./messageElemTyps/voiceElem";
import FileElem, { getFilePath } from "./messageElemTyps/fileElem";
import GroupTipsElemItem from "./messageElemTyps/grouptipsElem";
import VideoElem from "./messageElemTyps/videoElem";
import MergeElem from "./messageElemTyps/mergeElem";
import { Expression } from "./messageElemTyps/expression";
import { ForwardPopup } from "./components/forwardPopup";
import formateTime from "../../utils/timeFormat";
import {
  Icon,
  message,
  Progress,
  StatusTip,
  Bubble,
  Button,
} from "tea-component";
import { custEmojiUpsert } from "../../services/custEmoji";
import { custEmojiUpsertParams } from "../../services/custEmoji";
import { showDialog, checkFileExist, returnFileVla, checkfilepath } from "../../utils/tools";
import { addTimeDivider } from "../../utils/addTimeDivider";
import { HISTORY_MESSAGE_COUNT } from "../../constants";
import GroupSysElm from "./messageElemTyps/groupSystemElem";
import { setCurrentReplyUser } from "../../store/actions/message";
import { setImgViewerAction } from "../../store/actions/imgViewer";
import { ipcRenderer } from "electron";
import timRenderInstance from "../../utils/timRenderInstance";
import { useMessageDirect } from "../../utils/react-use/useDirectMsgPage";

const MESSAGE_MENU_ID = "MESSAGE_MENU_ID";
let CountId = 0;
type Props = {
  messageList: Array<State.message>;
  editorState;
  convType: number;
  groupType: number;
  convId: string;
};

const RIGHT_CLICK_MENU_LIST = [
  {
    id: "revoke",
    text: "撤回",
  },
  {
    id: "addCustEmoji",
    text: "添加到表情",
  },
  {
    id: "delete",
    text: "删除",
  },
  {
    id: "transimit",
    text: "转发",
  },
  {
    id: "fileSave",
    text: "另存为",
  },
  // {
  //     id: 'reply',
  //     text: '回复'
  // },
  {
    id: "multiSelect",
    text: "多选",
  },
  {
    id: "openFile",
    text: "文件夹目录",
  },
];

export const displayDiffMessage = (message, element, index) => {
  const { elem_type, ...res } = element;
  let resp;
  switch (elem_type) {
    case 0:
      resp = <TextElemItem {...res} />;
      break;
    case 1:
      resp = <PicElemItem {...res} message={message} />;
      break;
    case 2:
      resp = <VoiceElem {...res} />;
      break;
    case 3:
      // @ts-ignore
      resp = <CustomElem message={message} />;
      break;
    case 4:
      // @ts-ignore
      console.log('打印文件状态', element)
      console.log(checkfilepath(1, element.file_elem_file_id, element.file_elem_file_name))
      let istrue = checkfilepath(1, element.file_elem_file_id, element.file_elem_file_name)
      resp = <FileElem message={message} element={element} index={index} isshow={istrue ? true : false} />;
      break;
    case 5:
      resp = <GroupTipsElemItem {...res} />;
      break;
    case 6:
      // resp = <div>表情消息</div>
      resp = <Expression {...res}></Expression>;
      break;
    case 7:
      resp = <div>位置消息</div>;
      break;
    case 8:
      resp = <GroupSysElm {...res} />;
      break;
    case 9:
      resp = <VideoElem message={message} {...res} />;
      break;
    case 10:
      resp = <div>关系消息</div>;
      break;
    case 11:
      resp = <div>资料消息</div>;
      break;
    case 12:
      resp = <MergeElem {...res} message={message} />;
      break;
    default:
      resp = null;
      break;
  }
  return resp;
};

export const MessageView = (props: Props): JSX.Element => {
  const { messageList, editorState, convType, convId } = props;
  const messageViewRef = useRef(null);
  const [isTransimitPopup, setTransimitPopup] = useState(false);
  const [isMultiSelect, setMultiSelect] = useState(false);
  const [forwardType, setForwardType] = useState<ForwardType>(
    ForwardType.divide
  );
  const [seletedMessage, setSeletedMessage] = useState<State.message[]>([]);
  const [currMenuMessage, setCurrMenuMessage] = useState<State.message>(); // 当前右击菜单消息
  const [currServerTime, setCurServerTime] = useState(0);
  const [noMore, setNoMore] = useState(
    messageList.length < HISTORY_MESSAGE_COUNT ? true : false
  );
  const dispatch = useDispatch();
  const [anchor, setAnchor] = useState("");
  const [percent, setPercent] = useState("0%");
  const [tips, setTips] = useState("");
  //重新挂载
  const [messviewreload, setMessView] = useState(false);
  const {
    isShow,
    isCanOpenFileDir,
    index: imgPreViewUrlIndex,
    imgs,
  } = useSelector((state: State.RootState) => state.imgViewer);
  const directToMsgPage = useMessageDirect();
  console.log(
    "messageList---------------------------------------------------------------------",
    messageList
  );
  console.log(messageList.length)
  useEffect(() => {
    if (!anchor) {
      messageViewRef?.current?.firstChild?.scrollIntoViewIfNeeded();
    }
    setAnchor("");
    setNoMore(messageList.length < HISTORY_MESSAGE_COUNT ? true : false);
  }, [messageList.length]);
  useEffect(() => {
    ipcRenderer.on('download_reset_view', (e, percentage) => {
      setTips("下载中");
      setPercent(percentage)
      if (percentage == "100%") {
        setPercent("0%");
      }
    })
    ipcRenderer.on('download_reset', (e, boolean) => {
      console.log('查看下载完状态', boolean)
      if (boolean) {
        window.localStorage.setItem('File_list', window.localStorage.getItem('File_list_save'))
        // try {
        // 想通过自定义消息刷新
        //   return sendMsg({
        //     convId,
        //     convType:99,
        //     messageElementArray: [],
        //     userId:window.localStorage.getItem('uid')
        //   });
        // } catch (e) {
        //   message.error({ content: `出错了: ${e.message}` });
        // }
      }
    })
    ipcRenderer.on('UPLOAD_RESET_MESSAGE_VIEW', (e, boolean) => {
      if (boolean) {
        console.log('查看界面刷新', boolean)
        setMessView(true)
      }
    })
    // ipcRenderer.on('UPLOADPROGRESS', (e, percentage) => {
    //     setPercent(percentage)
    //     setTips('上传中')
    //     console.log(percentage, '进度条-----------------------------------------------------')
    // })
  }, []);
  useEffect(() => {
    if (percent == "100%") {
      setPercent("0%");
      setSeletedMessage([]);
      setMultiSelect(false);
    }
  }, [percent]);

  useEffect(() => {
    setSeletedMessage([]);
    setMultiSelect(false);
  }, [convId]);

  useEffect(() => {
    setSeletedMessage([]);
    setMultiSelect(false);
  }, [messviewreload]);

  const getNewGroupInfo = () => {
    let newGroupInfo: any = localStorage.getItem("newGroupInfo");
    newGroupInfo = newGroupInfo ? JSON.parse(newGroupInfo) : [];
    const length = messageList.length;
    const isGroupInfo = newGroupInfo.find((item) => item.key === convId);
    if (
      length === 3 &&
      messageList[0]?.message_elem_array[0]?.elem_type === 8 &&
      !isGroupInfo
    ) {
      newGroupInfo.push({
        key: messageList[0].message_elem_array[0].group_report_elem_group_id,
        value: messageList[0].message_elem_array[0].group_report_elem_op_user,
      });
      localStorage.setItem("newGroupInfo", JSON.stringify(newGroupInfo));
      return "";
    } else {
      return isGroupInfo ? `${isGroupInfo.value}创建了群聊` : "";
    }
  };

  const handleRevokeMsg = async (params) => {
    const { convId, msgId, convType } = params;
    const code = await revokeMsg({
      convId,
      convType,
      msgId,
    });
    code === 0 &&
      dispatch(
        markeMessageAsRevoke({
          convId,
          messageId: msgId,
        })
      );
  };
  const getLoadingStatus = () => {
    if (percent == "100%" || percent == "0%") {
      return <></>;
    } else {
      return (
        <StatusTip.LoadingTip
          className="loading"
          loadingText={`${tips}${percent}`}
        />
      );
    }
  };
  // 添加到自定义表情, 图片和自定义表情可添加
  const handleAddCustEmoji = async (params) => {
    const {
      elem_type,
      image_elem_large_url = "",
      custom_elem_data = "",
      custom_elem_desc,
      text_elem_content,
    } = params?.message?.message_elem_array[0];

    let sticker_url = "";
    if (elem_type === 1) {
      sticker_url = image_elem_large_url;
    } else if (onIsCustEmoji(elem_type, custom_elem_data)) {
      sticker_url = custom_elem_desc;
    } else if (onIsIncludeImg(elem_type, text_elem_content)) {
      sticker_url = /<img.*?src=[\"|\'"](.*?)[\"|\'"]/.exec(
        text_elem_content
      )[1];
    } else {
      return;
    }
    try {
      const userId = localStorage.getItem("uid");
      const emojiParams: custEmojiUpsertParams = {
        uid: userId,
        sticker_url,
        op_type: 1,
      };
      const data = await custEmojiUpsert(emojiParams);
      if (data.ErrorCode === 0) {
        message.success({ content: "添加成功" });
      } else {
        const content = data.ErrorInfo.replace(
          "already exists",
          "请勿重复添加表情"
        );
        message.error({ content });
      }
    } catch (e) {
      message.error({ content: "添加错误" });
    }
  };

  const handleDeleteMsg = async (params) => {
    const { convId, msgId, convType } = params;
    const code = await deleteMsg({
      convId,
      convType,
      msgId,
    });
    code === 0 &&
      dispatch(
        deleteMessage({
          convId,
          messageIdArray: [msgId],
        })
      );
  };

  const handleTransimitMsg = (params) => {
    console.log(params);
    const { message } = params;
    setTransimitPopup(true);
    setSeletedMessage([message]);
  };

  // const checkfilepath = (fileid) => {
  //   let filelist = window.localStorage.getItem('File_list') ? JSON.parse(window.localStorage.getItem('File_list')) : '';
  //   if (!filelist) return false
  //   if (filelist) {
  //     //换本地文件名
  //     for (let i = 0; i < filelist.length; i++) {
  //       if (filelist[i].id == fileid) {
  //         return filelist[i].name
  //       }
  //     }
  //   }
  // }

  const handleFileSave = async (params) => {
    console.log("文件另存为", params)
    if (params.message && params.message.message_elem_array) {
      let fileElement = params.message.message_elem_array[0];
      const { message_msg_id } = params.message
      let fileName = fileElement?.file_elem_file_name
      if (!fileName) {
        return
        //fileName = checkfilepath(fileElement.file_elem_file_id);
      }
      const filePath = getFilePath(fileName);
      const isExist = await checkFileExist(message_msg_id);
      const index = filePath.lastIndexOf(".");
      const ext = filePath.substr(index + 1);
      if (!isExist) {
        message.warning({ content: '文件未下载，请先下载' });
        return;
      }
      ipcRenderer.send('fileSave', {
        url: filePath,
        type: ext
      });
    }
  };

  const handleReplyMsg = (params) => {
    const { message } = params;
    const { message_sender, message_sender_profile } = message;
    dispatch(
      setCurrentReplyUser({
        profile: message_sender_profile,
      })
    );
  };

  const handleForwardPopupSuccess = async (convItemGroup: ConvItem[]) => {
    const userId = await getLoginUserID();
    const isDivideSending = forwardType === ForwardType.divide;
    const isCombineSending = !isDivideSending;
    const forwardMessage = seletedMessage.map((item) => ({
      ...item,
      message_is_forward_message: true,
    }));
    console.warn("forwardMessage", forwardMessage);
    convItemGroup.forEach(async (convItem, k) => {
      if (isDivideSending) {
        forwardMessage.forEach(async (message) => {
          const {
            data: { code, json_params },
          } = await sendForwardMessage({
            convId: getConvId(convItem),
            convType: getConvType(convItem),
            message: message,
            userId,
          });
          if (code === 0) {
            dispatch(
              reciMessage({
                convId: getConvId(convItem),
                messages: [JSON.parse(json_params)],
              })
            );
          }
        });
      } else if (isCombineSending) {
        console.warn("forwardMessage", forwardMessage);
        const {
          data: { code, json_params },
        } = await sendMergeMsg({
          convId: getConvId(convItem),
          convType: getConvType(convItem),
          messageElementArray: [
            {
              elem_type: 12,
              merge_elem_title: getMergeMessageTitle(forwardMessage[0]),
              merge_elem_abstract_array:
                getMergeMessageAbstactArray(forwardMessage),
              merge_elem_compatible_text: "你的版本不支持此消息",
              merge_elem_message_array: forwardMessage,
            },
          ],
          userId,
        });
        if (code === 0) {
          dispatch(
            reciMessage({
              convId: getConvId(convItem),
              messages: [JSON.parse(json_params)],
            })
          );
        }
      }
    });
    setForwardType(ForwardType.divide);
    setTransimitPopup(false);
    setSeletedMessage([]);
    setMultiSelect(false);
  };

  const handleForwardTypePopup = (type: ForwardType) => {
    if (!seletedMessage.length) return false;
    setTransimitPopup(true);
    setForwardType(type);
  };

  const deleteSelectedMessage = async () => {
    if (!seletedMessage.length) return;
    const { message_conv_id, message_conv_type } = seletedMessage[0];
    const messageList = seletedMessage.map((item) => item.message_msg_id);
    const params = {
      convId: message_conv_id,
      convType: message_conv_type,
      messageList,
    };
    const {
      data: { code },
    } = await deleteMsgList(params);

    if (code === 0) {
      dispatch(
        deleteMessage({
          convId: message_conv_id,
          messageIdArray: messageList,
        })
      );
      setMultiSelect(false);
      setSeletedMessage([]);
    } else {
      message.warning({ content: "删除消息失败" });
    }
  };

  const handleMultiSelectMsg = (params) => {
    setMultiSelect(true);
  };
  const handleSelectMessage = (message: State.message): void => {
    if (!isMultiSelect) {
      return;
    }
    const isMessageSelected =
      seletedMessage.findIndex(
        (v) => getMessageId(v) === getMessageId(message)
      ) > -1;
    if (isMessageSelected) {
      const list = seletedMessage.filter(
        (v) => getMessageId(v) !== getMessageId(message)
      );
      setSeletedMessage(list);
    } else {
      seletedMessage.push(message);
      setSeletedMessage(Array.from(seletedMessage));
    }
  };
  const handlRightClick = (e, id) => {
    const { data } = e.props;
    switch (id) {
      case "revoke":
        console.log(data)
        if (data?.message?.message_elem_array[0].elem_type != 5) {
          handleRevokeMsg(data);
          break;
        } else if (data?.message?.message_elem_array[0].elem_type == 5) {
          message.warning({
            content: "公告类型无法撤回消息哦",
          })
          break;
        }
        break;
      case "addCustEmoji":
        handleAddCustEmoji(data);
        break;
      case "delete":
        handleDeleteMsg(data);
        break;
      case "transimit":
        handleTransimitMsg(data);
        break;
      case "fileSave":
        handleFileSave(data);
        break;
      case "reply":
        handleReplyMsg(data);
        break;
      case "multiSelect":
        handleMultiSelectMsg(data);
        break;
      case "openFile":
        handleOpenFile(data);
        break;
    }
  };

  // 消息类型是否是自定义表情
  const onIsCustEmoji = (type, data) => {
    return type === 3 && data === "CUST_EMOJI";
  };
  const onIsIncludeImg = (type, content) => {
    return type === 0 && /<img.*?src=[\"|\']?(.*?)[\"|\']?.*?>/.test(content);
  };
  const handleContextMenuEvent = async (e, message: State.message) => {
    const { data: serverTime } = await timRenderInstance.TIMGetServerTime();
    e.preventDefault();
    setCurrMenuMessage(message);
    setCurServerTime(serverTime);
    contextMenu.show({
      id: MESSAGE_MENU_ID,
      event: e,
      props: {
        data: {
          convId: message.message_conv_id,
          msgId: message.message_msg_id,
          convType: message.message_conv_type,
          message: message,
        },
      },
    });
  };

  const handleMessageReSend = async (params) => {
    console.log(params);
    const { message_conv_id: conv_id, message_conv_type: conv_type } = params;
    const {
      data: { code, json_params },
    } = await timRenderInstance.TIMMsgSendMessage({
      conv_id,
      conv_type,
      params,
    });
    if (code === 0) {
      dispatch(
        updateMessages({
          convId: conv_id,
          message: JSON.parse(json_params),
        })
      );
    }
  };
  const handleOpenFile = (item) => {
    console.log(item);
    showDialog();
  };
  const validatelastMessage = (messageList: State.message[]) => {
    let msg: State.message;
    for (let i = messageList.length - 1;i > -1;i--) {
      if (messageList[i].message_msg_id) {
        msg = messageList[i];
        break;
      }
    }
    return msg;
  };
  const getMoreMsg = async () => {
    if (!noMore) {
      const msg: State.message = validatelastMessage(messageList);
      if (!msg) {
        return;
      }
      const { message_conv_id, message_conv_type, message_msg_id } = msg;
      const messageResponse = await getMsgList(
        message_conv_id,
        message_conv_type,
        message_msg_id
      );
      if (messageResponse.length > 0) {
        setAnchor(message_msg_id);
      } else {
        setNoMore(true);
      }
      const addTimeDividerResponse = addTimeDivider(messageResponse.reverse());
      const payload = {
        convId: message_conv_id,
        messages: addTimeDividerResponse.reverse(),
      };
      dispatch(addMoreMessage(payload));
    }
  };
  // 从发送消息时间开始算起，两分钟内可以编辑
  const isTimeoutFun = (time) => {
    const now = new Date();
    if (now.getTime() / 1000 - time > 2 * 60) {
      return false;
    } else {
      return true;
    }
  };

  const handleMsgReaded = async (UserId: Array<string>) => {
    const {
      data: { code, json_param },
    } = await timRenderInstance.TIMProfileGetUserProfileList({
      json_get_user_profile_list_param: {
        friendship_getprofilelist_param_identifier_array: UserId,
      },
    });
    directToMsgPage({
      convType: 1,
      profile: JSON.parse(json_param)[0],
    });
  };

  const reEdit = (data) => {
    let refSteat = [data, CountId++];
    editorState(refSteat);
  };

  // console.warn('查看当前会话所有消息',messageList)
  const getMenuItemData = () => {
    const {
      elem_type,
      custom_elem_data = "",
      text_elem_content,
    } = currMenuMessage.message_elem_array[0];

    // elemtype:1图片, 3 自定义消息为CUST_EMOJI类型
    const isEmoji =
      elem_type === 1 ||
      onIsCustEmoji(elem_type, custom_elem_data) ||
      onIsIncludeImg(elem_type, text_elem_content);
    const message_is_from_self = currMenuMessage.message_is_from_self;
    let menuData = RIGHT_CLICK_MENU_LIST;
    if (elem_type !== 4 && elem_type !== 9 && !isEmoji) {
      // 非文件过滤打开文件夹按钮
      menuData = menuData.filter((item) => item.id !== "fileSave");
      menuData = menuData.filter((item) => item.id !== "openFile");
    }
    if (!isEmoji) {
      // 过滤添加到表情MenuItem
      menuData = menuData.filter((item) => item.id !== "addCustEmoji");
    }
    if (
      currServerTime - currMenuMessage.message_server_time > 120 ||
      !message_is_from_self
    ) {
      // 超时或者不是本人发送消息则过滤撤回按钮
      menuData = menuData.filter((item) => item.id !== "revoke");
    }
    return menuData;
  };
  const getMenuItem = () => {
    const menuData = getMenuItemData();
    return menuData.map(({ id, text }) => {
      return (

        <Item key={id} onClick={(e) => handlRightClick(e, id)}>
          {text}
        </Item>
      );
    });
  };

  const reeditShowText = (item) => {
    return (
      item.message_is_from_self &&
      isTimeoutFun(item.message_client_time) &&
      item.message_elem_array[0].elem_type === 0 &&
      item.message_elem_array[0].text_elem_content.indexOf("<img src=") === -1
    );
  };
  // 点击某条消息中的图片时，拉起预览
  const handleImgMsgClick = (
    currentMsgItem,
    messageList,
    event: MouseEvent
  ) => {
    if (
      currentMsgItem.elem_type !== 10 &&
      currentMsgItem.elem_type !== 1 &&
      onIsCustEmoji(currentMsgItem.elem_type, currentMsgItem.custom_elem_data)
    ) {
      return;
    }
    console.log("item", currentMsgItem);
    console.log("event", event);
    let imgsUrl = [];
    const {
      image_elem_thumb_url: url1,
      image_elem_orig_url: url2,
      image_elem_large_url: url3,
    } = currentMsgItem;
    let currentUrl = url1 || url2 || url3;
    const txtAndImgStr = [];
    messageList.map((msgItem) => {
      if (msgItem) {
        const { message_elem_array } = msgItem;
        message_elem_array &&
          message_elem_array.map((elem, index) => {
            const {
              elem_type,
              image_elem_thumb_url,
              image_elem_orig_url,
              image_elem_large_url,
              custom_elem_data,
              custom_elem_desc,
              text_elem_content,
            } = elem;
            if (elem_type === 1) {
              const url =
                image_elem_thumb_url ||
                image_elem_orig_url ||
                image_elem_large_url;
              url && imgsUrl.push(url);
            } else if (onIsCustEmoji(elem_type, custom_elem_data)) {
              // 自定义表情
              custom_elem_desc && imgsUrl.push(custom_elem_desc);
            } else if (elem_type === 0) {
              // 图文消息
              txtAndImgStr.push({ content: text_elem_content });
            }
          });
      }
    });
    const {
      elem_type,
      text_elem_content,
      custom_elem_data,
      custom_elem_desc,
      file_elem_url,
    } = currentMsgItem;
    console.log(77777);
    if (elem_type === 0) {
      // const res = matchUrl([{ content: text_elem_content }])
      const currentNode = event.target as HTMLImageElement;
      if (currentNode.nodeName.toLocaleLowerCase() === "img") {
        currentUrl = currentNode.currentSrc;
      }
    } else if (elem_type === 4) {
      ipcRenderer.send('openfilenow', currentMsgItem)
    } else if (onIsCustEmoji(elem_type, custom_elem_data)) {
      currentUrl = custom_elem_desc;
    }
    if (txtAndImgStr.length) {
      imgsUrl = [].concat(matchUrl(txtAndImgStr), imgsUrl);
    }
    [...imgsUrl].reverse();
    let currentPreviewImgIndex = -1;
    currentPreviewImgIndex = imgsUrl.findIndex((url) => url === currentUrl);
    if (currentPreviewImgIndex > -1) {
      dispatch(
        setImgViewerAction({
          isShow: true,
          index: currentPreviewImgIndex,
          isCanOpenFileDir: true,
          imgs: imgsUrl,
        })
      );
    }
  };

  const handleCloseForwardModal = () => {
    setMultiSelect(false);
    setSeletedMessage([]);
  };
  return (
    <div className="message-view" ref={messageViewRef}>
      {getLoadingStatus()}
      {messageList &&
        messageList.length > 0 &&
        messageList.map((item, index) => {
          if (!item) {
            return null;
          }
          // if(item?.message_elem_array&& item?.message_elem_array[0] && item?.message_elem_array[0].elem_type == 3 && item?.message_elem_array[0].custom_elem_data && item?.message_elem_array[0].custom_elem_data.indexOf('actionType')>-1 && inviteID) {
          //   console.log(item?.message_elem_array[0].custom_elem_data)
          //   const result_trtc = JSON.parse(item?.message_elem_array[0].custom_elem_data)
          //   console.log('打印内容2',result_trtc)
          //   if(result_trtc.actionType == (2||4||5)) {
          //     return null;
          //   }
          // }
          if (item.isTimeDivider) {
            return (
              <div key={item.time} className="message-view__item--time-divider">
                {formateTime(item.time * 1000, true)}
              </div>
            );
          }
          // console.warn(item,'查看发送内容')
          const {
            message_elem_array,
            message_sender_profile,
            message_is_from_self,
            message_msg_id,
            message_status,
            message_is_peer_read,
            message_conv_type,
            message_conv_id,
            message_sender,
            message_client_time,
          } = item;
          const {
            user_profile_face_url,
            user_profile_nick_name,
            user_profile_identifier,
            user_profile_gender,
          } = message_sender_profile;
          const revokedPerson = message_is_from_self
            ? "你"
            : user_profile_nick_name;
          const isMessageSendFailed =
            message_status === 3 && message_is_from_self;
          const shouldShowPerReadIcon =
            message_conv_type === 1 &&
            message_is_from_self &&
            !isMessageSendFailed;
          const seleted =
            seletedMessage.findIndex(
              (i) => getMessageId(i) === getMessageId(item)
            ) > -1;
          const elemType = message_elem_array?.[0]?.elem_type; // 取message array的第一个判断消息类型
          const isNotGroupSysAndGroupTipsMessage = ![5, 8].includes(elemType); // 5,8作为群系统消息 不需要多选转发
          return (
            <React.Fragment key={message_msg_id || index}>
              {message_status === 6 ? (
                <div className="message-view__item is-revoked">
                  {`${revokedPerson} 撤回了一条消息`}
                  {reeditShowText(item) ? (
                    <span
                      className="message-view__item--withdraw"
                      onClick={() => {
                        reEdit(message_elem_array[0].text_elem_content);
                      }}
                    >
                      {" "}
                      重新编辑
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <div
                  key={message_msg_id || index}
                  onClick={() => handleSelectMessage(item)}
                  className={`message-view__item ${message_is_from_self ? "is-self" : ""
                    }`}
                >
                  {isMultiSelect &&
                    isNotGroupSysAndGroupTipsMessage &&
                    (seleted ? (
                      <Icon
                        className="message-view__item--icon"
                        type="success"
                      />
                    ) : (
                      <i className="message-view__item--icon-normal"></i>
                    ))}
                  <div className="message-view__item--avatar face-url">
                    <Bubble
                      placement={"right-start"}
                      trigger="click"
                      content={
                        <div className="card-content">
                          <div className="main-info">
                            <div className="info-item">
                              <Avatar
                                key={user_profile_identifier}
                                url={user_profile_face_url}
                                nickName={user_profile_nick_name}
                                userID={user_profile_identifier}
                              />
                              <div className="nickname">
                                {user_profile_nick_name || ""}
                              </div>
                            </div>
                          </div>
                          <div className="info-bar">
                            <Button
                              type="primary"
                              onClick={() =>
                                handleMsgReaded([user_profile_identifier])
                              }
                              style={{ width: "100%" }}
                            >
                              发消息
                            </Button>
                          </div>
                        </div>
                      }
                    >
                      <span style={{ display: "none" }}>占位</span>
                      <Avatar
                        url={user_profile_face_url}
                        isClick={false}
                        key={user_profile_identifier}
                        size="small"
                        nickName={user_profile_nick_name}
                        userID={user_profile_identifier}
                      />
                    </Bubble>
                  </div>
                  {message_elem_array &&
                    message_elem_array.length &&
                    message_elem_array.map((elment, index) => {
                      const { ...res } = elment;
                      return (
                        <div
                          className="message-view__item--element"
                          key={item.message_conv_id}
                        >
                          {
                            //群里会话列表添加名称  zwc
                            item.message_conv_type === 2 && (
                              <div className="message-view__nick_name">
                                {
                                  item.message_sender_profile
                                    .user_profile_nick_name
                                }
                              </div>
                            )
                          }
                          <div
                            onClick={handleImgMsgClick.bind(
                              this,
                              elment,
                              messageList
                            )}
                            onContextMenu={(e) => {
                              handleContextMenuEvent(e, item);
                            }}
                          >
                            {displayDiffMessage(item, elment, index)}
                          </div>
                        </div>
                      );
                    })}
                  {shouldShowPerReadIcon ? (
                    <span
                      className={`message-view__item--element-icon ${message_is_peer_read ? "is-read" : ""
                        }`}
                    ></span>
                  ) : (
                    isMessageSendFailed && (
                      <Icon
                        className="message-view__item--element-icon-error"
                        type="error"
                        onClick={() => handleMessageReSend(item)}
                      />
                    )
                  )}
                </div>
              )}
              <div className="message-view__item--blank"></div>
            </React.Fragment>
          );
        })}
      {convType === 2 ? (
        <div className="message-view__newgroup">{getNewGroupInfo()}</div>
      ) : (
        <></>
      )}
      <Menu id={MESSAGE_MENU_ID} theme={theme.light} animation={animation.fade}>
        {currMenuMessage && getMenuItem()}
      </Menu>
      {isTransimitPopup && (
        <ForwardPopup
          onSuccess={handleForwardPopupSuccess}
          onClose={() => {
            setTransimitPopup(false);
          }}
        />
      )}
      {isMultiSelect && (
        <div className="forward-type-popup">
          <Icon
            type="close"
            className="forward-type-popup__close"
            onClick={handleCloseForwardModal}
          />
          <div
            className="forward-type-popup__combine"
            onClick={() => handleForwardTypePopup(ForwardType.combine)}
          >
            <p>合并转发</p>
          </div>
          <div
            className="forward-type-popup__divide"
            onClick={() => handleForwardTypePopup(ForwardType.divide)}
          >
            <p>逐条转发</p>
          </div>
          <div
            className="forward-type-popup__delete"
            onClick={deleteSelectedMessage}
          >
            <p>删除</p>
          </div>
        </div>
      )}
      <div
        className={`showMore ${noMore ? "no-more" : ""}`}
        onClick={getMoreMsg}
      >
        {noMore ? "没有更多了" : "查看更多"}
      </div>
    </div>
  );
};