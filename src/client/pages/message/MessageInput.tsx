import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux';
import { Button, message, Dropdown, List } from 'tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendSoundMsg, sendVideoMsg, sendMsg } from './api'
import { reciMessage, updateMessages } from '../../store/actions/message'
import { AtPopup } from './components/atPopup'
import { EmojiPopup } from './components/emojiPopup'
import { RecordPopup } from './components/recordPopup';
import { Menu } from '../../components/menu';
import BraftEditor, { EditorState } from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css'
import './message-input.scss';
import { convertBase64UrlToBlob } from "../../utils/tools";
import { SDKAPPID, TIM_BASE_URL } from '../../constants/index'
import { setPathToLS } from '../../utils/messageUtils';
import { sendCustomMsg } from '../message/api'
import { ipcRenderer, clipboard, nativeImage } from 'electron';
import chooseImg from '../../assets/icon/choose.png'
import { GET_VIDEO_INFO, RENDERPROCESSCALL, SELECT_FILES } from '../../../app/const/const';
import { blockRendererFn, blockExportFn } from './CustomBlock';
import { bufferToBase64Url, fileImgToBase64Url, getMessageElemArray, getPasteText } from './message-input-util';
import { electron } from 'webpack';

type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    handleOpenCallWindow: (callType: string, convType: number, windowType: string) => void;
}

const SUPPORT_IMAGE_TYPE = ['png', 'jpg', 'gif', 'PNG', 'JPG', 'GIF'];
const SUPPORT_VIDEO_TYPE = ['MP4', 'MOV', 'WMV', 'mp4', 'mov', 'wmv'];

const FEATURE_LIST_GROUP = [{
    id: 'face',
}, {
    id: 'photo'
}, {
    id: 'file'
    // }
    //  ,{
    //     id: 'video'
    // }
    // ,{
    //     id: 'phone'
}, {
    id: 'screen-shot',
    content: '截图(Ctrl + Shift + X)'
    // }, {
    //     id: 'more',
    //     content: '更多'
}]
const FEATURE_LIST_C2C = [{
    id: 'face',
}, {
    id: 'photo'
}, {
    id: 'file'
    // },
    // {
    //     id: 'video'
    // },
    //  {
    //     id: 'phone'
}, {
    id: 'screen-shot',
    content: '截图(Ctrl + Shift + X)'
    // }, {
    //     id: 'more',
    //     content: '更多'
}]
const FEATURE_LIST = {
    1: FEATURE_LIST_C2C, 2: FEATURE_LIST_GROUP
}
export const MessageInput = (props: Props): JSX.Element => {
    const { convId, convType, isShutUpAll, handleOpenCallWindow } = props;
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

    const { userId } = useSelector((state: State.RootState) => state.userInfo);
    const filePicker = React.useRef(null);
    const imagePicker = React.useRef(null);
    const videoPicker = React.useRef(null);
    const soundPicker = React.useRef(null);
    const dispatch = useDispatch();
    const placeHolderText = isShutUpAll ? '已全员禁言' : '请输入消息';
    const [sendType, setSendType] = useState(null);
    let editorInstance;

    const userSig = window.localStorage.getItem('usersig')
    const uid = window.localStorage.getItem('uid')
    window.localStorage.setItem('inputAt', '0')
    window.localStorage.setItem('convId', convId)
    // 上传逻辑
    const handleUpload = (base64Data) => {
        return new Promise((resolve, reject) => {
            axios
                .post(`${TIM_BASE_URL}/huarun/im_cos_msg/pre_sig`, {
                    sdkappid: SDKAPPID,
                    uid: uid,
                    userSig: userSig,
                    file_type: 1,
                    file_name: "headUrl/" + new Date().getTime() + 'screenShot.png',
                    Duration: 900,
                    upload_method: 0,
                })
                .then((res) => {
                    // console.log(res);
                    const { download_url } = res.data;
                    // console.log(111111);
                    // console.log(download_url);
                    axios
                        .put(download_url, convertBase64UrlToBlob(base64Data), {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                        })
                        .then(() => {
                            const { download_url } = res.data;
                            resolve(download_url)
                        })
                        .catch((err) => {
                            reject(err);
                        })
                        .finally(() => {

                        });
                })
                .catch((err) => {
                    reject(err);

                });
        });
    };


    function startapi(requestlist, toTextContent) {
        //定义counts，用来收集请求的次数，（也可以用reslist的length进行判断）
        let counts = 0;
        return function apirequest(data) {
            let arg = data
            let a = new Promise((res, rej) => {
                //setTimeout模拟请求到接收的时间需要5秒钟
                setTimeout(function () {
                    res('成功返回数据');

                }, 1000)
                // handleSendMsg(data,toTextContent).then(res)
            })
            //无论成功或者失败都要进行下一次，以免阻塞，成功请求的末尾有s标志，失败的末尾有f标志
            a.then(() => {
                counts++;
                if (counts > requestlist.length) {
                    return;
                }
                console.log('counts', counts)

                apirequest(requestlist[counts])
            }).catch(err => {
                //递归调用
                apirequest(requestlist[counts])
                console.log(err)
            })
        }

    }

    const handleSendTextMsg = async () => {
        try {
            const text = editorState.toText()
            const atList = getAtList(text)
            setEditorState(ContentUtils.clear(editorState))
            const { data: { code, json_params, desc } } = await sendTextMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 0,
                    text_elem_content: editorState.toText(),
                }],
                userId,
                messageAtArray: atList
            });

            if (code === 0) {
                dispatch(reciMessage({
                    convId,
                    messages: [JSON.parse(json_params)]
                }))
            }

        } catch (e) {
            message.error({ content: `出错了: ${e.message}` })
        }
    }

    const handleSendMsg = async () => {
        try {
            const rawData = editorState.toRAW();

            const messageElementArray = getMessageElemArray(rawData, videoInfos);

            if (messageElementArray.length) {
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
                        userId,
                    });
                }));

                const results = await Promise.all(fetchList);
                console.log(results)
                for (const res of results) {
                    const { data: { code, json_params, desc } } = res;
                    if (code === 0) {
                        dispatch(updateMessages({
                            convId,
                            message: JSON.parse(json_params)
                        }))
                    }
                    setEditorState(ContentUtils.clear(editorState));
                }
            }
        } catch (e) {
            message.error({ content: `出错了: ${e.message}` });
        }
        setAtUserMap({});
        setVideoInfos([]);
    }

    const getAtList = (text: string) => {
        const list = text.match(/@[a-zA-Z0-9_\u4e00-\u9fa5]+/g);
        const atNameList = list ? list.map(v => v.slice(1)) : [];
        return atNameList.map(v => atUserMap[v]);
    }


    const setFile = async (file: File | { size: number; type: string; path: string; name: string; fileContent: string }) => {
        if (file) {
            const fileSize = file.size;
            const type = file.type;
            if (SUPPORT_IMAGE_TYPE.find(v => type.includes(v))) {
                if (fileSize > 28 * 1024 * 1024) return message.error({ content: "image size can not exceed 28m" })
                // console.log(file)
                file = JSON.parse(window.localStorage.getItem('imageObj'))
                console.log(file)
                const imgUrl = file instanceof File ? await fileImgToBase64Url(file) : bufferToBase64Url(file.fileContent, type);
                console.log(imgUrl, 'imgUrl')
                setEditorState(preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-image', true, { name: file.name, path: file.path, size: file.size, base64URL: imgUrl }));
            } else if (SUPPORT_VIDEO_TYPE.find(v => type.includes(v))) {
                if (fileSize > 100 * 1024 * 1024) return message.error({ content: "video size can not exceed 100m" })
                ipcRenderer.send(RENDERPROCESSCALL, {
                    type: GET_VIDEO_INFO,
                    params: { path: file.path }
                })
                setEditorState(preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-video', true, { name: file.name, path: file.path, size: file.size }));
            } else {
                if (fileSize > 100 * 1024 * 1024) return message.error({ content: "file size can not exceed 100m" })
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
    }

    const sendMessages = (type, params) => {
        switch (type) {
            case "image":
                sendImageMessage(params)
                break
            case "audio":
                sendSoundMessage(params)
                break
            case "video":
                sendVideoMessage(params)
                break
            default:
                sendFileMessage(params)
        }
    }

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
            convId,
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
                convId,
                message: JSON.parse(json_params)
            }))
        } else {
            message.error({ content: `消息发送失败 ${desc}` })
        }
    }

    const sendFileMessage = async ({ filePath, fileSize, fileName }) => {
        if (!filePath) return false;
        console.log(44444444444444, fileSize)
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

    const sendVideoMessage = async ({
        videoDuration,
        videoPath,
        videoSize,
        videoType,
        screenshotPath,
        screenshotWidth,
        screenshotHeight,
        screenshotType,
        screenshotSize
    }) => {
        const params = {
            convId,
            convType,
            messageElementArray: [{
                elem_type: 9,
                video_elem_video_type: videoType,
                video_elem_video_size: videoSize,
                video_elem_video_duration: videoDuration,
                video_elem_video_path: videoPath,
                video_elem_image_type: screenshotType,
                video_elem_image_size: screenshotSize,
                video_elem_image_width: screenshotWidth,
                video_elem_image_height: screenshotHeight,
                video_elem_image_path: screenshotPath
            }],
            userId,
        }
        const { data: { code, json_params, desc } } = await sendVideoMsg(params);
        if (code === 0) {
            dispatch(updateMessages({
                convId,
                message: JSON.parse(json_params)
            }))
        } else {
            message.error({ content: `消息发送失败 ${desc}` })
        }
    }

    const sendSoundMessage = async (file) => {
        if (!file) return false;
        const { data: { code, json_params } } = await sendSoundMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 2,
                sound_elem_file_path: file.value,
                sound_elem_file_size: file.size,
                sound_elem_file_time: 10,
            }],
            userId,
        });
    }

    const handleSendAtMessage = () => {
        // resetState()
        window.localStorage.setItem('inputAt', '0')
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

    const onAtPopupCallback = (userId: string, userName: string) => {
        resetState()
        if (userId) {
            const atText = userName || userId;
            setAtUserMap(pre => ({ ...pre, [atText]: userId }));
            setEditorState(ContentUtils.insertText(editorState, `${atText} `))
        }
        if (userName) {
            const isInputAt = window.localStorage.getItem('inputAt')
            console.log(isInputAt, '0000000000000')
            const text = Number(isInputAt) ? `${userName} ` : `${userName} `
            setEditorState(ContentUtils.insertText(editorState, text))
        }
    }

    const handleSendCustEmojiMessage = async (url) => {
        try {

            const { data: { code, json_params, desc } } = await sendCustomMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 3,
                    custom_elem_data: 'CUST_EMOJI',
                    custom_elem_desc: url,
                    custom_elem_ext: '自定义表情'
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
        if (sendType == '0') {
            // enter发送
            if (e.ctrlKey && e.keyCode === 13) {
                // console.log('换行', '----------------------', editorState)
            } else if (e.keyCode == 13 || e.charCode === 13) {
                e.preventDefault();
                handleSendTextMsg();
            } else if ((e.key === "@" || (e.keyCode === 229 && e.code === "Digit2")) && convType === 2) {
                e.preventDefault();
                setAtPopup(true)
            }
        } else {
            // Ctrl+enter发送
            if (e.ctrlKey && e.keyCode === 13) {
                e.preventDefault();
                handleSendTextMsg();
            } else if (e.keyCode == 13 || e.charCode === 13) {
                // console.log('换行', '----------------------', editorState)
            } else if ((e.key === "@" || (e.keyCode === 229 && e.code === "Digit2")) && convType === 2) {
                window.localStorage.setItem('inputAt', '1')
                e.preventDefault()
                setAtPopup(true)
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

    const handleRecordPopupCallback = (path) => {
        resetState()
        if (path) {
            console.log(path)
        }
    }

    const handleCallMenuClick = (item) => {
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
        if (!hasAt) {
            setAtPopup(false);
            return;
        }
        // 取最后一个@后的内容作为搜索条件
        const textArr = text.split('@');
        const lastInput = textArr[textArr.length - 1];
        setAtInput(lastInput);
    }

    const handlePastedText = (text: string, htmlString: string) => {
        const patseText = getPasteText(htmlString);
        setEditorState(ContentUtils.insertText(editorState, patseText))
    }

    const handlePastedFiles = async (files: File[]) => {
        for (const file of files) {
            setFile(file);
        }
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
        ipcRenderer.send('CHANGESTORE', index)
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 38 || e.charCode === 38) {
            if (atPopup) {
                e.preventDefault();
            }
        }
        if (e.keyCode === 40 || e.charCode === 40) {
            if (atPopup) {
                e.preventDefault();
            }
        }
    }

    const keyBindingFn = (e) => {
        if (e.keyCode === 13 || e.charCode === 13) {
            e.preventDefault();
            return 'enter';
        }
        if (e.key === "@" && e.shiftKey && convType === 2) {
            e.preventDefault();
            return '@';
        }
    }

    const handleKeyCommand = (e) => {
        switch (e) {
            case 'enter': {
                if (!atPopup) {
                    handleSendMsg();
                }
                return 'not-handled';
            }
            case '@': {
                setAtPopup(true);
                setEditorState(ContentUtils.insertText(editorState, ` @`))
                return 'not-handled';
            }
        }
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
        ipcRenderer.on("GET_FILE_INFO_CALLBACK", listener)
        return () => {
            ipcRenderer.off("GET_FILE_INFO_CALLBACK", listener)
        }
    }, [convId, convType])

    useEffect(() => {
        setEditorState(ContentUtils.clear(editorState))
    }, [convId, convType]);

    useEffect(() => {
        ipcRenderer.on('SENDSTORE', function (e, data) {
            setSendType(data)
        })
        setShotKeyTip(sendType == '1' ? ' 按Ctrl+Enter键发送消息' : '按Enter键发送消息')
        ipcRenderer.on('screenShotUrl', (e, { data, url }) => {
            console.log(data, url, '+++++++++++++++++++')

            if (data.length == 0) {
                message.error({ content: '已取消截图' })
            } else {
                // debugger
                const file = new File([data], new Date().getTime() + 'screenShot.png', { type: 'image/jpeg' })
                // console.log(file, '截图文件对象')
                const fileObj = {
                    lastModified: file.lastModified,
                    //@ts-ignore
                    lastModifiedDate: file.lastModifiedDate,
                    name: file.name,
                    imagePath: url,
                    size: file.size,
                    type: file.type,
                    //@ts-ignore
                    webkitRelativePath: file.webkitRelativePath
                }
                const imageObj = {
                    lastModified: file.lastModified,
                    //@ts-ignore
                    lastModifiedDate: file.lastModifiedDate,
                    name: file.name,
                    path: url,
                    size: file.size,
                    type: file.type,
                    //@ts-ignore
                    webkitRelativePath: file.webkitRelativePath
                }
                // console.log(convId, '截图文件对象22222', file, fileObj)
                // const image = nativeImage.createFromPath(url)
                // clipboard.writeImage(image)
                window.localStorage.setItem('imageObj', JSON.stringify(imageObj))
                sendMessages('image', fileObj)
                return
            }
        })
        ipcRenderer.on('getFile', async (e, { data, filedirPath }) => {
            //  console.log('getFile url', filedirPath);
            const file = new File([data], new Date().getTime() + 'screenShot.png', { type: 'image/jpeg' })
            const fileObj = {
                lastModified: file.lastModified,
                //@ts-ignore
                lastModifiedDate: file.lastModifiedDate,
                name: file.name,
                path: filedirPath,
                size: file.size,
                type: file.type,
                //@ts-ignore
                webkitRelativePath: file.webkitRelativePath
            }
            //@ts-ignore
            await sendImageMessage(fileObj)
            setEditorState(ContentUtils.clear(editorState))
        })
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

                    FEATURE_LIST[convType].map(({ id }) => (
                        <span
                            key={id}
                            className={`message-input__feature-area--icon ${id} ${activeFeature === id ? 'is-active' : ''}`}
                            onClick={() => handleFeatureClick(id)}
                        />
                    ))
                }
            </div>
            {/* <div className="message-input__text-area" onKeyDown={handleKeyDown}> */}
            <div className="message-input__text-area disabled" onDragOver={e => e.preventDefault()} onKeyDown={handleOnkeyPress}>
                <BraftEditor
                    stripPastedStyles
                    //@ts-ignore
                    disabled={isShutUpAll}
                    onChange={editorChange}
                    value={editorState}
                    media={{ pasteImage: false }}
                    ref={instance => editorInstance = instance}
                    handlePastedFiles={handlePastedFiles}
                    handlePastedText={handlePastedText}
                    blockRendererFn={blockRendererFn}
                    keyBindingFn={keyBindingFn}
                    handleKeyCommand={handleKeyCommand}
                    contentStyle={{ height: '100%', fontSize: 14 }}
                    converts={{ blockExportFn }}
                    placeholder={placeHolderText}
                    maxLength={4480}
                    actions={[]}
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendMsg} disabled={editorState.toText() === ''}>发送</Button>
            </div>
            {/* <span className="message-input__down" title='切换发送消息快捷键'></span> */}
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
            <input ref={filePicker} onChange={e => sendFileMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
            <input ref={imagePicker} accept="image/*" onChange={e => sendImageMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
        </div>
    )

}