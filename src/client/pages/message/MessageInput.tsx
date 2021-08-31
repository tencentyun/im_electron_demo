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

const options = {
    defaultValue: 3500, // 指定默认限制数，如不指定则为Infinity(无限)
};
BraftEditor.use(MaxLength(options));

type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    isHandCal?: Array<string | number>,
    handleOpenCallWindow: (callType: string, convType: number, windowType: string) => void;
}

const SUPPORT_IMAGE_TYPE = ['png', 'jpg', 'gif', 'PNG', 'JPG', 'GIF'];
const SUPPORT_VIDEO_TYPE = ['MP4', 'MOV', 'mp4', 'mov'];

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
}]
const FEATURE_LIST = {
    1: FEATURE_LIST_C2C, 2: FEATURE_LIST_GROUP
}
export const MessageInput = (props: Props): JSX.Element => {
    const { convId, convType, isShutUpAll, handleOpenCallWindow, isHandCal } = props;
    const [isDraging, setDraging] = useState(false);
    const [activeFeature, setActiveFeature] = useState('');
    const [shouldShowCallMenu, setShowCallMenu] = useState(false);
    const [atPopup, setAtPopup] = useState(false);
    const [isEmojiPopup, setEmojiPopup] = useState(false);
    const [isRecordPopup, setRecordPopup] = useState(false);
    const [shotKeyTip, setShotKeyTip] = useState('按Enter键发送消息');
    const [editorState, setEditorState] = useState<EditorState>(BraftEditor.createEditorState(null, { blockExportFn }))
    const [videoInfos, setVideoInfos] = useState([]);
    const [atUserNameInput, setAtInput] = useState('');
    const [atUserMap, setAtUserMap] = useState({});
    const [isZHCNAndFirstPopup, setIsZHCNAndFirstPopup] = useState(false);
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
    console.log(editorState)
    const [sendType, setSendType] = useState(null); // 0->enter,1->ctrl+enter
    let editorInstance;

    //我的
    useEffect(() => {
        reedite(isHandCal)
    }, [isHandCal])
    const handleSendMsg = async () => {
        // console.log(editorState.toText().trim() == '', typeof editorState.toText())
        try {
            if (isShutUpAll) {
                message.warning({
                    content: "群主已全员禁言，无法发送消息哦",
                })
            }
            const rawData = editorState.toRAW();
            let messageElementArray = getMessageElemArray(rawData, videoInfos);
            console.log(messageElementArray, "调试内容");

            const sendMsgSuccessCallback = ([res, userData]) => {
                const { code, json_params, desc } = res;

                if (code === 0) {                
                    dispatch(updateMessages({
                        convId,
                        message: JSON.parse(json_params)
                    }))
                }
            };

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
    // const getData = async () => {
    //     const response = await getConversionList();
    //     dispatch(replaceConversaionList(response))
    //     if (response.length) {
    //         dispatch(updateCurrentSelectedConversation(response[0]))
    //     } else {
    //         dispatch(updateCurrentSelectedConversation(null))
    //     }
    // }

    //发送消息
    const handlSendMsg = async (event,{messageElementArray, isDirectory})=> {
        if(isDirectory){
            message.warning({
                content: "文件夹无法上传！",
            })
            return  true
        }
        const fetchList = messageElementArray.map((v => {
            if (v.elem_type === 0) {
                const atList = getAtList(v.text_elem_content);
                return sendMsg({
                    convId,
                    convType,
                    messageElementArray: [v],
                    userId,
                    messageAtArray: atList
                });
            }
            return sendMsg({
                convId,
                convType,
                messageElementArray: [v],
                userId
            });
        }));

        setEditorState(ContentUtils.clear(editorState));
        const results = await Promise.all(fetchList);
        console.log(results, 'result========================')
        for (const res of results) {
            console.log(res, '0000000000000000000000')
            const { data: { code, json_params, desc } } = res;
            if (code === 0) {
                //清空预上传文件
                ipcRenderer.send("delectTemporaryFiles")
                dispatch(updateMessages({
                    convId,
                    message: JSON.parse(json_params)
                }))
            }
            // setEditorState(ContentUtils.clear(editorState));
        }
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
                })
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

        }
        setActiveFeature(featureId);
    }

    const clearAtText = (state) => {
        const newEditorState = ContentUtils.undo(state);
        const text = newEditorState.toText();
        const lastAt = text.lastIndexOf("@");
        const hasText = text.substring(lastAt).split('@')[1] !== "";
        if( hasText ) {
            clearAtText(newEditorState);
        } else {
            return newEditorState;
        }
    };

    const onAtPopupCallback = (userId: string, userName: string) => {
        resetState()
        if (userId) {
            const atText = userName || userId;
            setAtUserMap(pre => ({...pre, [atText]: userId}));
            const justHaveAt = editorState.toText().substring(editorState.toText().lastIndexOf("@")) === "@";
            if(!justHaveAt) {
                const newEditorState = clearAtText(editorState);
                setEditorState(ContentUtils.insertText(newEditorState, `${atText} `));
            } else {
                setEditorState(ContentUtils.insertText(editorState, `${atText} `));
            }
            
            setAtInput('');
        }
    }

    const handleSendCustEmojiMessage = async (url) => {
        try {

            const { data: { code, json_params, desc } } = await sendCustomMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 6,
                    // @ts-ignore
                    face_elem_buf: url
                }],
                userId
            });
            if (code === 0) {
                dispatch(reciMessage({
                    convId,
                    messages: [JSON.parse(json_params)]
                }))
            } else {
                message.error({ content: `消息发送失败 ${desc}` })
            }
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
        console.log(data[0], editorState)
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
                    setVideoInfos(pre => [...pre, data]);
                    break;
                }
            }
        }
        const errorConsole = (event, data) => {
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
        ipcRenderer.on('temporaryFilesWeb', handlSendMsg);
        return () => {
            ipcRenderer.off('screenShotUrl', screenShotUrlListiner);
            ipcRenderer.off('temporaryFilesWeb', ()=>{});
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
                <Button type="primary" onClick={handleSendMsg} disabled={editorState.toText() === ''}>发送</Button>
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