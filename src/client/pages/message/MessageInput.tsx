import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux';
import { Button, message } from 'tea-component';
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
import { ipcRenderer, clipboard } from 'electron';
import { GET_VIDEO_INFO, RENDERPROCESSCALL, SELECT_FILES } from '../../../app/const/const';
import { blockRendererFn, blockExportFn } from './CustomBlock';
import { bufferToBase64Url, fileImgToBase64Url, getMessageElemArray, getPasteText } from './message-input-util';

type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    handleOpenCallWindow: (callType: string, convType: number, windowType: string) => void;
}

const FEATURE_LIST_GROUP = [{
    id: 'face',
}, {
    id: 'photo'
}, {
    id: 'file'
}
    , {
    id: 'video'
}
    , {
    id: 'phone'
}]
const FEATURE_LIST_C2C = [{
    id: 'face',
}, {
    id: 'photo'
}, {
    id: 'file'
},
{
    id: 'video'
},
{
    id: 'phone'
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
    const [editorState, setEditorState] = useState<EditorState>(BraftEditor.createEditorState(null, { blockExportFn }))
    const [videoInfos, setVideoInfos] = useState([]);
    const [atUserNameInput, setAtInput] = useState('');
    const [atUserMap, setAtUserMap] = useState({});

    const { userId } = useSelector((state: State.RootState) => state.userInfo);

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

    const selectVideoMessage = () => {
        ipcRenderer.send(RENDERPROCESSCALL, {
            type: SELECT_FILES,
            params: {
                fileType: "video",
                extensions: ["mp4", "mov", "wmv"],
                multiSelections: false
            }
        })
    }

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
            console.log
            if (type.includes('png') || type.includes('jpg')) {
                if (fileSize > 28 * 1024 * 1024) return message.error({ content: "image size can not exceed 28m" })
                const imgUrl = file instanceof File ? await fileImgToBase64Url(file) : bufferToBase64Url(file.fileContent, type);
                setEditorState(preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-image', true, { name: file.name, path: file.path, size: file.size, base64URL: imgUrl }));
            } else if (type.includes('mp4') || type.includes('mov')) {
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

    const selectImageMessage = () => {
        ipcRenderer.send(RENDERPROCESSCALL, {
            type: SELECT_FILES,
            params: {
                fileType: "image",
                extensions: ["png", "jpg"],
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
    const sendImageMessage = async ({ imagePath }) => {
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

<<<<<<< HEAD
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
=======
    const sendVideoMessage = async (file) => {
        if (file) {
            // console.log(file)
            const { data: { code, json_params, desc } } = await sendVideoMsg({
                convId: window.localStorage.getItem('convId'),
                convType,
                messageElementArray: [{
                    elem_type: 9,
                    video_elem_video_type: file.videoType,
                    video_elem_video_size: file.videoSize,
                    video_elem_video_duration: file.videoDuration,
                    video_elem_video_path: file.videoPath,
                    video_elem_image_type: file.screenshotType,
                    video_elem_image_size: file.screenshotSize,
                    video_elem_image_width: file.screenshotWidth,
                    video_elem_image_height: file.screenshotHeight,
                    video_elem_image_path: file.screenshotPath
                }],
                userId,
            });
            console.log(code)
            console.log(json_params)
            console.log(desc)
            if (code === 0) {
                dispatch(reciMessage({
                    convId: window.localStorage.getItem('convId'),
                    messages: [JSON.parse(json_params)]
                }))
            } else if (code === 7006) {
                dispatch(reciMessage({
                    convId: window.localStorage.getItem('convId'),
                    messages: [JSON.parse(json_params)]
                }))
            } else {
                // debugger
                console.info(json_params)
                message.error({ content: `消息发送失败 ${desc}` })
            }
>>>>>>> 9363410c8cf7a7a2955986a40adbce13084b7e5a
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
            const text = Number(isInputAt) ? `${userName} ` : `@${userName} `
            setEditorState(ContentUtils.insertText(editorState, text))
        }
    }
    const handleScreenShot = () => {
        clipboard.clear()
        ipcRenderer.send('SCREENSHOT')
    }
    const handleOnkeyPress = (e) => {
        // const type = sendType
        if (editorState?.toText().substring(editorState?.toText().length - 1, editorState?.toText().length) === '@') {
            setEditorState(ContentUtils.insertText(editorState.substring(0, editorState?.toText().length - 1), ''))
        }
        // if(editorState.toText().substring(editorState.toText().length-1,editorState.toText().length) === '@'){
        //     console.info(787878)
        //     setEditorState(ContentUtils.insertText(editorState.toText().substring(0,editorState.toText().length-1), ''))
        // }
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

    const onEmojiPopupCallback = (id) => {
        resetState();
        if (id) {
            setEditorState(ContentUtils.insertText(editorState, id))
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
            <div className="message-input__text-area" onKeyDown={handleKeyDown}>
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
                    actions={[]}
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendMsg} disabled={editorState.toText() === ''}>发送</Button>
            </div>
            {
                isRecordPopup && <RecordPopup onSend={handleRecordPopupCallback} onCancel={() => setRecordPopup(false)} />
            }
        </div>
    )

}