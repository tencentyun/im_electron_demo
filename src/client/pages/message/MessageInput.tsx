import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux';
import { Button, message, Dropdown, List, Bubble } from 'tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendVideoMsg, sendMsg, getConversionList } from './api'
import { replaceConversaionList, updateCurrentSelectedConversation } from '../../store/actions/conversation';
import { updateMessages, reciMessage } from '../../store/actions/message'
import { AtPopup } from './components/atPopup'
import { EmojiPopup } from './components/emojiPopup'
import { RecordPopup } from './components/recordPopup';
import { Menu } from '../../components/menu';
import BraftEditor, { EditorState } from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css'
import './message-input.scss';
import { convertBase64UrlToBlob } from "../../utils/tools";
import { SDKAPPID } from '../../constants/index'
import { setPathToLS } from '../../utils/messageUtils';
import { sendCustomMsg } from '../message/api'
// @ts-ignore
import { ipcRenderer, clipboard, nativeImage } from 'electron';
// @ts-ignore
import chooseImg from '../../assets/icon/choose.png'
import { GET_VIDEO_INFO, RENDERPROCESSCALL, SELECT_FILES } from '../../../app/const/const';
import { blockRendererFn, blockExportFn } from './CustomBlock';
import { bufferToBase64Url, fileImgToBase64Url, getMessageElemArray, getPasteText, fileReaderAsBuffer, generateTemplateElement } from './message-input-util';
import MaxLength from 'braft-extensions/dist/max-length'
import Store from "electron-store";
const store = new Store();
import { ChatRecord } from '../../components/chatRecord/chatRecord'
import { useDialogRef } from "../../utils/react-use/useDialog";

const options = {
    defaultValue: 3500, // 指定默认限制数，如不指定则为Infinity(无限)
};
BraftEditor.use(MaxLength(options));

type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    handleHistorProp?:Function,
    isHandCal?: Array<string | number>,
    handleOpenCallWindow: (callType: string, convType: number, windowType: string) => void;
}

const SUPPORT_IMAGE_TYPE = ['png', 'jpg', 'gif', 'PNG', 'JPG', 'GIF'];
const SUPPORT_VIDEO_TYPE = ['MP4', 'MOV', 'mp4', 'mov'];

function getDifference(a, b)
{
    var i = 0;
    var j = 0;
    var result = "";

    while (j < b.length)
    {
        if (a[i] != b[j] || i == a.length)
            result += b[j];
        else
            i++;
        j++;
    }
    return result;
}

const differenceBetweenTwoString = (str1, str2) => {
    const array1 = str1.split('');
    const array2 = str2.split('');
    const baseArray = array1.length > array2.length ? array1 : array2;
    const compareArray = array1.length > array2.length ? array2 : array1;
    const difference = [];
    baseArray.forEach((item, index) => {
        if(compareArray[index] !== item) {
            difference.push(item);
        }
    });

    return difference.join("");
}
const FEATURE_LIST_GROUP = [{
    id: 'face',
    content: '发表情'
},
// {
// id: 'at',
// content: '@其他人'
// },
{
    id: 'photo',
    content: '发图片'
}, {
    id: 'file',
    content: '发文件'
},
{
    id: 'video',
    content: '发视频'
},
{
    id: 'phone',
    content: '语音'
},
{
    id: 'screen-shot',
    content: '截图(Ctrl + Shift + X)'
},{
    id: 'histor',
    content: '聊天记录'
}]
const FEATURE_LIST_C2C = [{
    id: 'face',
    content: '发表情'
}, {
    id: 'photo',
    content: '发图片'
}, {
    id: 'file',
    content: '发文件'
},
{
    id: 'video',
    content: '发视频'
},
{
    id: 'phone',
    content: '语音'
},
{
    id: 'screen-shot',
    content: '截图(Ctrl + Shift + X)'
},{
    id: 'histor',
    content: '聊天记录'
}]
const FEATURE_LIST = {
    1: FEATURE_LIST_C2C, 2: FEATURE_LIST_GROUP
}
//修改状态
export const MessageInput = (props: Props): JSX.Element =>{
    const dialogRef = useDialogRef();
    const handleHistor = () => dialogRef.current.open();
    return(
        <>
            <MessageInputOriginal {...props} handleHistorProp={handleHistor}></MessageInputOriginal>
            <ChatRecord dialogRef={dialogRef} conv_type={props.convType} conv_id={props.convId}></ChatRecord>
        </>
    )
}

export const MessageInputOriginal = (props: Props): JSX.Element => {
    FEATURE_LIST_C2C[5].content =  `截图(${store.get("settingScreen")?.toString()})`;
    FEATURE_LIST_GROUP[5].content =`截图(${store.get("settingScreen")?.toString()})`;

    const { convId, convType, isShutUpAll, handleOpenCallWindow, isHandCal, handleHistorProp } = props;
    const [isDraging, setDraging] = useState(false);
    const [activeFeature, setActiveFeature] = useState('');
    const [shouldShowCallMenu, setShowCallMenu] = useState(false);
    //解决打开文件无法发送问题
    const [sendMessageFile, setMessageFile] = useState({messageElementArray:[],isDirectory:false});
    const [atPopup, setAtPopup] = useState(false);
    const [isEmojiPopup, setEmojiPopup] = useState(false);
    const [isRecordPopup, setRecordPopup] = useState(false);
    const [shotKeyTip, setShotKeyTip] = useState('按Enter键发送消息');
    const [editorState, setEditorState] = useState<EditorState>(BraftEditor.createEditorState(null, { blockExportFn }))
    const [videoInfos, setVideoInfos] = useState([]);
    const [atUserNameInput, setAtInput] = useState('');
    const [atUserMap, setAtUserMap] = useState({});
    const [isZHCNAndFirstPopup, setIsZHCNAndFirstPopup] = useState(false);
    const [isAnalysizeVideo, setAnalysizeVideoInfoStatus ] = useState(false);
    //@ts-ignore
    const filePicker = React.useRef(null);
    const imagePicker = React.useRef(null);
    const videoPicker = React.useRef(null);
    const soundPicker = React.useRef(null);

    const { userId, signature, nickName, faceUrl, role, gender, addPermission } = useSelector((state: State.RootState) => state.userInfo);
    const userProfile = {
        ser_profile_role: role,
        user_profile_face_url: faceUrl,
        user_profile_nick_name: nickName,
        user_profile_identifier: userId,
        user_profile_gender: gender,
        user_profile_self_signature: signature,
        user_profile_add_permission: addPermission
    }


    const dispatch = useDispatch();
    const placeHolderText = isShutUpAll ? '已全员禁言' : '请输入消息';
    const [sendType, setSendType] = useState(null); // 0->enter,1->ctrl+enter
    let editorInstance;

    //我的
    useEffect(() => {
        reedite(isHandCal)
    }, [isHandCal])

    //发送消息
    useEffect(() => {
        handlSendMsg(sendMessageFile)
    }, [sendMessageFile])

    const sendMsgSuccessCallback = ([res, userData]) => {
            const { code, json_params, desc } = res;

            if (code === 0) {             
                dispatch(updateMessages({
                    convId,
                    message: JSON.parse(json_params)
                }))
            }
    };

    //发送消息
    const handlSendMsg = async ({messageElementArray, isDirectory})=> {
            if(isDirectory){
                message.warning({
                    content: "文件夹无法上传！",
                })
                return  true
            }
            if(messageElementArray?.length){
                messageElementArray.forEach( async v => {
                    if(v.elem_type === 0) {
                        const atList = getAtList(v.text_elem_content);
                        const { data: messageId } = await sendMsg({
                            convId,
                            convType,
                            messageElementArray: [v],
                            userId,
                            messageAtArray: atList,
                            callback: sendMsgSuccessCallback
                        });
                        const templateElement = await generateTemplateElement(convId, convType, userProfile, messageId, v) as State.message;
                        dispatch(updateMessages({
                            convId,
                            message: templateElement
                        }));
                        return
                    }
                    const { data: messageId } = await sendMsg({
                        convId,
                        convType,
                        messageElementArray: [v],
                        userId,
                        callback: sendMsgSuccessCallback
                    });
        
                    const templateElement = await generateTemplateElement(convId, convType, userProfile, messageId, v) as State.message;
                    dispatch(updateMessages({
                        convId,
                        message: templateElement
                    }));
                });
        
                setEditorState(ContentUtils.clear(editorState));
            }
   }
    
    const handleSendMsg = async () => {
        // console.log(editorState.toText().trim() == '', typeof editorState.toText())
        try {
            if(isAnalysizeVideo) {
                message.warning({
                    content: "视频解析中, 无法发送!"
                });
                return;
            }
            if (isShutUpAll) {
                message.warning({
                    content: "群主已全员禁言，无法发送消息哦",
                })
            }
            const rawData = editorState.toRAW();
            let messageElementArray = getMessageElemArray(rawData, videoInfos);
            console.log(messageElementArray, "调试内容");

            if (messageElementArray[0] && messageElementArray[0].text_elem_content) {
                messageElementArray[0].text_elem_content = messageElementArray[0].text_elem_content.substring(0, options.defaultValue)
            }
            if (messageElementArray.length) {

                //解决换行多次发送问题  -- zwc
                let textElement = messageElementArray.filter(item => item.elem_type == 0)
                if (textElement.length > 0) {
                    let outerlement = messageElementArray.filter(item => item.elem_type != 0)
                    let obj: any = {
                        elem_type: textElement[0].elem_type,
                        text_elem_content: textElement.map(item => item.text_elem_content).join('\n')
                    }
                    messageElementArray = [obj, ...outerlement]
                }
                
                
                ipcRenderer.send("temporaryFiles", messageElementArray)

            }
        } catch (e) {
            message.error({ content: `出错了: ${e.message}` });
        }
        // getData()
        setAtUserMap({});
        setVideoInfos([]);
    }
    
    const getAtList = (text: string) => {
        const list = text.match(/@[a-zA-Z0-9_\u4e00-\u9fa5]+/g);
        const atNameList = list ? list.map(v => v.slice(1)) : [];
        return atNameList.map(v => atUserMap[v]);
    }

    const filePathAdapter = async (file) => {
        let templateFile = file;
        if (templateFile.path === "") {
            const formatedFile = file instanceof File && await fileReaderAsBuffer(file);
            templateFile = formatedFile;
        }
        return templateFile;
    }

    const setFile = async (file: File | { size: number; type: string; path: string; name: string; fileContent: string }) => {
        file = await filePathAdapter(file);
        if (file) {
            const fileSize = file.size;
            const type = file.type;
            if (fileSize === 0) {
                message.error({ content: "文件大小异常" })
                return
            }
            if (SUPPORT_IMAGE_TYPE.find(v => type.includes(v)) || type == "image/jpeg") {
                if (fileSize > 28 * 1024 * 1024) return message.error({ content: "image size can not exceed 28m" })
                const imgUrl = file instanceof File ? await fileImgToBase64Url(file) : bufferToBase64Url(file.fileContent, type);
                // @ts-ignore
                setEditorState(preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-image', true, { name: file.name, path: file.path, size: file.size, base64URL: imgUrl }));
            } else if (SUPPORT_VIDEO_TYPE.find(v => type.includes(v))) {
                if (fileSize > 100 * 1024 * 1024) return message.error({ content: "video size can not exceed 100m" })
                ipcRenderer.send(RENDERPROCESSCALL, {
                    type: GET_VIDEO_INFO,
                    // @ts-ignore
                    params: { path: file.path }
                });
                setAnalysizeVideoInfoStatus(true);
                // @ts-ignore
                setEditorState(preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-video', true, { name: file.name, path: file.path, size: file.size }));
            } else {
                if (fileSize > 100 * 1024 * 1024) return message.error({ content: "file size can not exceed 100m" })
                // @ts-ignore
                setEditorState(preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-file', true, { name: file.name, path: file.path, size: file.size }));
            }
        }
    }

    const handleDropFile = (e) => {

        const files = e.dataTransfer?.files || [];
        for (const file of files) {
            setFile(file);
        }
        setDraging(false);
        return 'handled';
    }

    // const sendMessages = (type, params) => {
    //     switch (type) {
    //         case "image":
    //             sendImageMessage(params)
    //             break
    //         case "audio":
    //             sendSoundMessage(params)
    //             break
    //         case "video":
    //             sendVideoMessage(params)
    //             break
    //         default:
    //             sendFileMessage(params)
    //     }
    // }

    const handleDragEnter = e => {
        setDraging(true);
    };

    const handleDragLeave = () => {
        setDraging(false);
    }

    const handleSendPhotoMessage = () => {
        imagePicker.current.click();
    }

    const handleSendSoundMessage = () => {
        //soundPicker.current.click();
        setRecordPopup(true)
    }
    const handleSendFileMessage = () => {
        filePicker.current.click();
    }

    const selectImageMessage = () => {
        ipcRenderer.send(RENDERPROCESSCALL, {
            type: SELECT_FILES,
            params: {
                fileType: "image",
                extensions: SUPPORT_IMAGE_TYPE,
                multiSelections: false
            }
        })
    }
    const selectSoundMessage = () => {
    }
    const selectFileMessage = () => {
        ipcRenderer.send(RENDERPROCESSCALL, {
            type: SELECT_FILES,
            params: {
                fileType: "file",
                extensions: ["*"],
                multiSelections: false
            }
        })
    }
    const selectVideoMessage = () => {
        ipcRenderer.send(RENDERPROCESSCALL, {
            type: SELECT_FILES,
            params: {
                fileType: "video",
                extensions: SUPPORT_VIDEO_TYPE,
                multiSelections: false
            }
        })
    }
    const sendImageMessage = async ({ imagePath }) => {
        console.log(imagePath)
        if (!imagePath) return false;
        const { data: { code, desc, json_params } } = await sendImageMsg({
            convId: window.localStorage.getItem('convId'),
            convType,
            messageElementArray: [{
                elem_type: 1,
                image_elem_orig_path: imagePath,
                image_elem_level: 0
            }],
            userId,
        });
        if (code === 0) {
            dispatch(updateMessages({
                convId: window.localStorage.getItem('convId'),
                message: JSON.parse(json_params)
            }))
        } else {
            message.error({ content: `消息发送失败 ${desc}` })
        }
    }

    const sendFileMessage = async ({ filePath, fileSize, fileName }) => {
        if (!filePath) return false;
        if (fileSize > 100 * 1024 * 1024) return message.error({ content: "file size can not exceed 100m" })
        const { data: { code, desc, json_params } } = await sendFileMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 4,
                file_elem_file_path: filePath,
                file_elem_file_name: fileName,
                file_elem_file_size: fileSize
            }],
            userId,
        });
        if (code === 0) {
            dispatch(updateMessages({
                convId,
                message: JSON.parse(json_params)
            }))
            setPathToLS(filePath)
        } else {
            message.error({ content: `消息发送失败 ${desc}` })
        }
    }

    const handleSendAtMessage = () => {
        convType === 2 && setAtPopup(true)
    }

    const handleSendFaceMessage = () => {
        // resetState()
        setEmojiPopup(true)
    }
    const handleSendPhoneMessage = () => {
        setShowCallMenu(true);
    }
    const handleFeatureClick = (featureId) => {
        switch (featureId) {
            case "face":
                handleSendFaceMessage()
                break;
            case "at":
                if (convType === 2) handleSendAtMessage()
                break;
            case "photo":
                selectImageMessage()
                break;
            case "file":
                selectFileMessage()
                break;
            case "voice":
                selectSoundMessage()
                break;
            case "video":
                selectVideoMessage()
                break;
            case "phone":
                handleSendPhoneMessage()
                break;
            case "more":
                selectVideoMessage()
                break;
            case "screen-shot":
                handleScreenShot()
                break;
            case "histor":
                handleHistorProp()
                break;    

        }
        setActiveFeature(featureId);
    }

    const diffMessage = (state) => {
        const oldText = editorState.toText();
        const newText = state.toText();
        if(newText === "") {
            return {
                isUnDoExpected: false,
                differenceText: oldText
            }
        }
        const differenceText = differenceBetweenTwoString(oldText, newText);
        return {
            isUnDoExpected:  differenceText === atUserNameInput,
            differenceText
        }
    };

    const clearAtText = (state) => {
        const newEditorState = ContentUtils.undo(state);
        const { isUnDoExpected,  differenceText} = diffMessage(newEditorState);
        if(!isUnDoExpected && !differenceText.includes('@') ) {
            clearAtText(newEditorState);
        } else {
            return {
                isUnDoExpected,
                newEditorState,
                differenceText
            }
        }
    };

    const onAtPopupCallback = (userId: string, userName: string) => {
        resetState()
        if (userId) {
            const atText = userName || userId;
            setAtUserMap(pre => ({...pre, [atText]: userId}));
            const justHaveAt = editorState.toText().substring(editorState.toText().lastIndexOf("@")) === "@";
            if(!justHaveAt) {
                const {
                    isUnDoExpected,
                    newEditorState,
                    differenceText
                } = clearAtText(editorState);
                if(isUnDoExpected) {
                    setEditorState(ContentUtils.insertText(newEditorState, `${atText} `));
                } else {
                    setEditorState(ContentUtils.insertText(newEditorState, `@${atText} `));
                }
            } else {
                setEditorState(ContentUtils.insertText(editorState, `${atText} `));
            }
            
            setAtInput('');
        }
    }

    const handleSendCustEmojiMessage = async (url) => {
        try {
            //修改自定义表情无法发送
            let VimgFace = {
                elem_type: 6,
                // @ts-ignore
                face_elem_buf: url
            }
            const { data: messageId } = await sendCustomMsg({
                convId,
                convType,
                messageElementArray: [VimgFace],
                userId,
                callback: sendMsgSuccessCallback
            });
            const templateElement = await generateTemplateElement(convId, convType, userProfile, messageId, VimgFace) as State.message;
            dispatch(updateMessages({
                convId,
                message: templateElement
            }));

        } catch (e) {
            message.error({ content: `出错了: ${e.message}` })
        }
    }

    const handleScreenShot = () => {
        clipboard.clear()
        ipcRenderer.send('SCREENSHOT')
    }
  

    const handleOnkeyPress = (e) => {
        // const hasImage = editorState.toHTML().includes('image')
        // const hasFile = editorState.toHTML().includes('block-file')
        // if (sendType == '0') {
        //     // enter发送
        //     if (e.ctrlKey && e.keyCode === 13) {
        //         // console.log('换行', '----------------------', editorState)
        //     } else if (e.keyCode == 13 || e.charCode === 13) {
        //         e.preventDefault();
        //         if (hasImage || hasFile) {
        //             !atPopup && handleSendMsg();
        //         } else {
        //             !canSendMsg() && handleSendMsg();
        //         }

        //     } else if ((e.key === "@" || (e.keyCode === 229 && e.code === "Digit2")) && convType === 2) {
        //         e.preventDefault();
        //         setAtPopup(true)
        //     }
        // } else {
        //     // Ctrl+enter发送
        //     if (e.ctrlKey && e.keyCode === 13) {
        //         e.preventDefault();
        //         if (hasImage || hasFile) {
        //             handleSendMsg();
        //         } else {
        //             !canSendMsg() && handleSendMsg();
        //         }
        //     } else if (e.keyCode == 13 || e.charCode === 13) {
        //         // console.log('换行', '----------------------', editorState)
        //     } else if ((e.key === "@" || (e.keyCode === 229 && e.code === "Digit2")) && convType === 2) {
        //         window.localStorage.setItem('inputAt', '1')
        //         e.preventDefault()
        //         setAtPopup(true)
        //     }
        // }

        if (sendType == '0') {
            // enter发送
            if (e.ctrlKey && e.keyCode === 13) {
                // console.log('换行', '----------------------', editorState)
            } else if (e.keyCode == 13 || e.charCode === 13) {
                e.preventDefault();
                !atPopup && handleSendMsg();
            }
        } else {
            // Ctrl+enter发送
            if (e.ctrlKey && e.keyCode === 13) {
                e.preventDefault();
                !atPopup && handleSendMsg();
            } else if (e.keyCode == 13 || e.charCode === 13) {
                // console.log('换行', '----------------------', editorState)
            }
        }

        if(e.keyCode === 38 || e.charCode === 38) {
            if(atPopup) {
                e.preventDefault();
            }
        }
        if(e.keyCode === 40 || e.charCode === 40) {
            if(atPopup) {
                e.preventDefault();
            }
        }

    }

    const onEmojiPopupCallback = (id, type) => {
        console.log(id)
        console.log(type)
        resetState()
        if (type === 'CUST_EMOJI') {
            // 发送自定义表情
            console.log(768678)
            handleSendCustEmojiMessage(id)
        } else {
            if (id) {
                setEditorState(ContentUtils.insertText(editorState, id))
            }
        }
    }

    //重新编辑
    const reedite = (data) => {
        setEditorState(ContentUtils.insertText(editorState, data[0]))
    }
    const handleRecordPopupCallback = (path) => {
        resetState()
        if (path) {
            console.log(path)
        }
    }

    const handleCallMenuClick = (item) => {
        console.log(item)
        if (item) handleOpenCallWindow(item.id, convType, "");
        setShowCallMenu(false);
    };

    const resetState = () => {
        setAtPopup(false)
        setEmojiPopup(false)
        setRecordPopup(false)
        setActiveFeature("")
    }

    const editorChange = (newEditorState) => {
        setEditorState(newEditorState)
        const text = newEditorState.toText();
        const hasAt = text.includes('@');
        /**
         * 中文输入法下会触发两次change 第一次change时无法拿到真正的输入内容 
         * 用isZHCNAndFirstPopup字段判断是否中文输入法下按下@ 并且首次change
         */
        if (!hasAt && atPopup && !isZHCNAndFirstPopup) {
            setAtPopup(false);
            return;
        }
        setIsZHCNAndFirstPopup(false);
        // 取最后一个@后的内容作为搜索条件
        const textArr = text.split('@');
        const lastInput = textArr[textArr.length - 1];
        setAtInput(lastInput);
    }

    const handlePastedText = (text: string, htmlString: string) => {
        let patseText = text
        if (htmlString) {
            patseText = getPasteText(htmlString);
        }
        setEditorState(ContentUtils.insertText(editorState, patseText))
    }


    const handlePastedFiles = (files: File[]) => {
        for (const file of files) {
            setFile(file);
        }
        return 'handled';
    }
    const menu = close => (
        <List type="option" style={{ width: '200px', background: '#ffffff' }}>
            <List.Item onClick={() => changeSendShotcut('1')} style={{ display: 'flex' }}>
                {
                    sendType == '1' ? <img className="chooseImg" src={chooseImg}></img> : <span style={{ padding: '0 10px' }}></span>
                }
                按Ctrl+Enter键发送消息
            </List.Item>
            <List.Item onClick={() => changeSendShotcut('0')} style={{ display: 'flex' }}>
                {
                    sendType == '0' ? <img className="chooseImg" src={chooseImg}></img> : <span style={{ padding: '0 10px' }}></span>
                }
                按Enter键发送消息
            </List.Item>
        </List>
    );
    const changeSendShotcut = index => {
        const tip = index == '1' ? '按Ctrl+Enter键发送消息' : '按Enter键发送消息'
        setShotKeyTip(tip)
        setSendType(index)
        window.localStorage.setItem('sendMsgKey', index)
    }


    const keyBindingFn = (e) => {
        if(e.keyCode === 13 || e.charCode === 13) {
            if(atPopup) {
                 e.preventDefault();
                return 'enter';
            }
        } else if(e.key === "@" && e.shiftKey && convType === 2) {
            e.preventDefault();
            setAtPopup(true);
            setEditorState(ContentUtils.insertText(editorState, ` @`))
            return '@';
        } else if (e.key === "Process" && e.shiftKey && convType === 2){
            e.preventDefault();
            setIsZHCNAndFirstPopup(true);
            setAtPopup(true);
            return 'zh-cn-@';
        }
    }

    const handleKeyCommand = (e) => {
        switch (e) {
            case 'enter': {
                return 'not-handled';
            }
            case '@': {
                return 'not-handled';
            }
            case 'zh-cn-@': {
                return 'not-handled';
            }
        }
    }

    const canSendMsg = () => {
        return editorState.toText().trim() === ''
    }

    useEffect(() => {
        setAnalysizeVideoInfoStatus(false);
        const listener = (event, params) => {
            console.log(event)
            console.log(params)
            const { triggerType, data } = params;
            switch (triggerType) {
                case 'SELECT_FILES': {
                    setFile(data);
                    break;
                }
                case 'GET_VIDEO_INFO': {
                    setAnalysizeVideoInfoStatus(false);
                    setVideoInfos(pre => [...pre, data]);
                    break;
                }
            }
        }
        const errorConsole = (event, data) => {
            message.error({content: '视频解析出错，请重试!'});
            setEditorState(ContentUtils.clear(editorState));
            setAnalysizeVideoInfoStatus(false);
            console.error('==========main process error===========', data);
        }

        ipcRenderer.on('main-process-error', errorConsole)
        ipcRenderer.on("GET_FILE_INFO_CALLBACK", listener)
        return () => {
            ipcRenderer.off("GET_FILE_INFO_CALLBACK", listener)
            ipcRenderer.off('main-process-error', errorConsole)
        }
    }, [convId, convType])

    useEffect(() => {
        setEditorState(ContentUtils.clear(editorState))
    }, [convId, convType]);

    useEffect(() => {
        const initVal = window.localStorage.getItem('sendMsgKey') || '0'
        setSendType(initVal)
        setShotKeyTip(sendType == '1' ? ' 按Ctrl+Enter键发送消息' : '按Enter键发送消息');

        // 自带截图生成的图片
        const screenShotUrlListiner = (event, { data, url }) => {
            console.log(typeof data, data, url, '+++++++++++++++++++')
            if (data.length == 0) {
                message.error({ content: '已取消截图' })
            } else {
                const file = new File([data], new Date().getTime() + 'screenShot.png', { type: 'image/jpeg' })
                // const fileObj = {
                //     lastModified: file.lastModified,
                //     // @ts-ignore
                //     lastModifiedDate: file.lastModifiedDate,
                //     name: file.name,
                //     path: url,
                //     size: file.size,
                //     type: 'png',
                //     fileContent: data,
                //     //@ts-ignore 
                //     webkitRelativePath: file.webkitRelativePath
                // }
                const imageObj = {
                    lastModified: file.lastModified,
                    //@ts-ignore 
                    lastModifiedDate: file.lastModifiedDate,
                    name: file.name,
                    path: url,
                    size: file.size,
                    type: file.type,
                    //@ts-ignore 
                    webkitRelativePath: file.webkitRelativePath,
                    fileContent: data,
                }
                // console.log(convId, '截图文件对象22222', file, fileObj)
                // const image = nativeImage.createFromPath(url)
                // clipboard.writeImage(image)
                // window.localStorage.setItem('imageObj', JSON.stringify(imageObj))
                // sendMessages('image', fileObj)
                // handlePastedFiles([imageObj])
                setFile(imageObj)
                return
            }
        }

        
        ipcRenderer.on('screenShotUrl', screenShotUrlListiner);
        ipcRenderer.on('temporaryFilesWeb', (event, data)=>{
            setMessageFile(data)
        });
        return () => {
            ipcRenderer.off('screenShotUrl', screenShotUrlListiner);
            ipcRenderer.off('temporaryFilesWeb', (event, data)=>{
                setMessageFile(data)
            });
        }
    }, [])

    const shutUpStyle = isShutUpAll ? 'disabled-style' : '';
    const dragEnterStyle = isDraging ? 'draging-style' : '';
    return (
        <div className={`message-input ${shutUpStyle} ${dragEnterStyle}`} onDrop={handleDropFile} onDragLeaveCapture={handleDragLeave} onDragOver={handleDragEnter} >
            {
                atPopup && <AtPopup callback={(userId, name) => onAtPopupCallback(userId, name)} atUserNameInput={atUserNameInput} group_id={convId} />
            }
            <div className="message-input__feature-area">
                {
                    isEmojiPopup && <EmojiPopup callback={onEmojiPopupCallback} />
                }
                {
                    shouldShowCallMenu && <Menu options={[{ text: '语音通话', id: '1' }, { text: '视频通话', id: '2' }]} onSelect={handleCallMenuClick} />
                }
                {

                    FEATURE_LIST[convType].map(({ id, content }) => (
                        <span
                            key={id}
                            title={content}
                            className={`message-input__feature-area--icon ${id} ${activeFeature === id ? 'is-active' : ''}`}
                            onClick={() => handleFeatureClick(id)}
                        />
                    ))
                }
            </div>
            <div className="message-input__text-area" onKeyDown={handleOnkeyPress}>
                <BraftEditor
                    stripPastedStyles
                    //@ts-ignore
                    disabled={isShutUpAll}
                    onChange={editorChange}
                    value={editorState}
                    media={{ pasteImage: false }}
                    ref={instance => editorInstance = instance}
                    // handlePastedFiles={handlePastedFiles}
                    // handlePastedText={handlePastedText}
                    blockRendererFn={blockRendererFn}
                    keyBindingFn={keyBindingFn}
                    handleKeyCommand={handleKeyCommand}
                    contentStyle={{ height: '100%', fontSize: 14 }}
                    converts={{ blockExportFn }}
                    placeholder={placeHolderText}
                    draftProps={{ handlePastedFiles, handlePastedText, handleDroppedFiles: () => 'handled' }}
                    maxLength={options.defaultValue}
                    actions={[]}
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendMsg} disabled={editorState.toText() === '' || isAnalysizeVideo}>发送</Button>
            </div>
            <Dropdown
                clickClose={true}
                className="message-input__down"
                button=""
                appearance="button"
                onOpen={() => console.log('open')}
                onClose={() => console.log("close")}
                placement='left-end'
                placementOffset='100'
                boxSizeSync
            >
                {menu}
            </Dropdown>
            {
                isRecordPopup && <RecordPopup onSend={handleRecordPopupCallback} onCancel={() => setRecordPopup(false)} />
            }
        </div>
    )
}