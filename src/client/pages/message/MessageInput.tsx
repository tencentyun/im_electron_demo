import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, message } from 'tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendSoundMsg, sendVideoMsg, sendMsg, sendMergeMsg } from './api'
import { reciMessage, updateMessages } from '../../store/actions/message'
import { AtPopup } from './components/atPopup'
import { EmojiPopup } from './components/emojiPopup'
import { RecordPopup } from './components/recordPopup';
import { Menu } from '../../components/menu';
import BraftEditor, { EditorState } from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css'
import './message-input.scss';
import { setPathToLS } from '../../utils/messageUtils';
import { ipcRenderer } from 'electron';
import { GET_VIDEO_INFO, RENDERPROCESSCALL, SELECT_FILES } from '../../../app/const/const';
import { blockRendererFn, blockExportFn } from './CustomBlock';
import { createImgBase64Url, getMessageElemArray, getPasteText } from './pasteInputConfig';
  
type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    handleOpenCallWindow: (callType: string,convType:number,windowType:string) => void;
}

const FEATURE_LIST_GROUP = [{
    id: 'face',
},{
    id: 'photo'
}, {
    id: 'file'
}
//  ,{
//     id: 'video'
// }
,{
    id: 'phone'
}]
const FEATURE_LIST_C2C = [{
    id: 'face',
}, {
    id: 'photo'
}, {
    id: 'file'
},
// {
//     id: 'video'
// }
// ,
 {
    id: 'phone'
}]
const FEATURE_LIST = {
    1: FEATURE_LIST_C2C, 2: FEATURE_LIST_GROUP
}
export const MessageInput = (props: Props): JSX.Element => {
    const { convId, convType, isShutUpAll, handleOpenCallWindow } = props;
    const [ isDraging, setDraging] = useState(false);
    const [ activeFeature, setActiveFeature ] = useState('');
    const [ shouldShowCallMenu, setShowCallMenu] = useState(false);
    const [ atPopup, setAtPopup ] = useState(false);
    const [ isEmojiPopup, setEmojiPopup ] = useState(false);
    const [ isRecordPopup, setRecordPopup ] = useState(false);
    const [ editorState, setEditorState ] = useState<EditorState>(BraftEditor.createEditorState(null, { blockExportFn }))
    const [ videoInfos, setVideoInfos] = useState([]);
    const [ atUserNameInput, setAtInput] = useState('');
    const [ atUserMap, setAtUserMap] = useState({});

    const { userId } = useSelector((state: State.RootState) => state.userInfo);

    const dispatch = useDispatch();
    const placeHolderText = isShutUpAll ? '已全员禁言' : '请输入消息';
    let editorInstance;

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
            const text = editorState.toText();
            const RAWData = editorState.toRAW();
            const atList = getAtList(text);

            const messageElementArray = getMessageElemArray(RAWData, videoInfos);

            if(messageElementArray.length) {
                const { data: { code, json_params, desc } } = await sendMsg({
                    convId,
                    convType,
                    messageElementArray,
                    userId,
                    messageAtArray: atList
                });
    
                if (code === 0) {                
                    dispatch(updateMessages({
                        convId,
                        message: JSON.parse(json_params)
                    }))
                }
                setEditorState(ContentUtils.clear(editorState));
            }
        } catch (e) {
            message.error({ content: `出错了: ${e.message}` });
        }
        setVideoInfos([]);
    }

    const getAtList = (text: string) => {
        const list = text.match(/@[a-zA-Z0-9_\u4e00-\u9fa5]+/g);
        const atNameList =  list ? list.map(v => v.slice(1)) : [];
        return atNameList.map(v => atUserMap[v]);
    }

    const handleDropFile = (e) => {
        const file = e.dataTransfer?.files[0]
        const iterator = file.type.matchAll(/(\w+)\//g)
        const type = iterator.next().value[1];
        const params = getSendMessageParamsByFile(type, file)
        setDraging(false);
        sendMessages(type, params)
    }

    const getSendMessageParamsByFile = (type, file) => {
        switch(type) {
            case "image":
                return { 
                    imagePath: file.path 
                }
            case "audio":
                return { 
                    audioPath: file.path 
                }
            case "video":
                return {
                    videoPath: file.value, 
                    videoSize: file.size,
                }
            default:
                return {
                    filePath: file.path,
                    fileName: file.name,
                    fileSize: file.size
                }
        }
    }
    const sendMessages = (type, params) => {
        switch(type) {
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
        ipcRenderer.send(RENDERPROCESSCALL,{
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
        ipcRenderer.send(RENDERPROCESSCALL,{
            type: SELECT_FILES,
            params: {
                fileType: "file",
                extensions: ["*"],
                multiSelections: false
            }
        })
    }
    const selectVideoMessage = () => {
        ipcRenderer.send(RENDERPROCESSCALL,{
            type: SELECT_FILES,
            params: {
                fileType: "video",
                extensions: ["mp4", "mov"],
                multiSelections: false
            }
        })
    }
    const sendImageMessage = async ({ imagePath }) => {
        if(!imagePath) return false;
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
            message.error({content: `消息发送失败 ${desc}`})
        }
    }

    const sendFileMessage = async ({ filePath, fileSize, fileName }) => {
        if(!filePath) return false;
        console.log(44444444444444, fileSize)
        if(fileSize > 100 * 1024 * 1024) return message.error({content: "file size can not exceed 100m"})
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
            message.error({content: `消息发送失败 ${desc}`})
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
        console.log('发视频参数',params)
        const { data: { code, json_params, desc } } = await sendVideoMsg(params);
        if (code === 0) {
            dispatch(updateMessages({
                convId,
                message: JSON.parse(json_params)
            }))
        } else {
            message.error({content: `消息发送失败 ${desc}`})
        }
    }

    const sendSoundMessage = async (file) => {
        if(!file) return false;
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
        convType === 2 && setAtPopup(true)
    }

    const handleSendFaceMessage = () => {
        // resetState()
        setEmojiPopup(true)
    }
    const handleSendPhoneMessage = ()=> {
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

    const handleOnkeyPress = (e) => {

        if (e.keyCode == 13 || e.charCode === 13) {
            e.stopPropagation();
            e.preventDefault();
            handleSendMsg();
        } else if(e.key === "@" && convType === 2) {
            e.preventDefault();
            e.stopPropagation();
            setAtPopup(true)
        } 
    }

    const onAtPopupCallback = (userId: string, userName: string) => {
        resetState()
        if (userId) {
            const atText = userName || userId;
            setAtUserMap(pre => ({...pre, [atText]: userId}));
            setEditorState(ContentUtils.insertText(editorState, `${atText} `))
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
        if(item) handleOpenCallWindow(item.id,convType,"");
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
        if(!hasAt) {
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
        console.log('files', files);
        for (const file of files) {
            if(file) {
                const fileSize = file.size;
                if(fileSize > 100 * 1024 * 1024) return message.error({content: "file size can not exceed 100m"})
                const type = file.type;
                if (type.includes('image')) {
                    const imgUrl = await createImgBase64Url(file);
                    setEditorState( preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-image', true, { name: file.name, path: file.path, size: file.size, base64URL: imgUrl }));
                } else if ( type.includes('mp4') || type.includes('mov')){
                    ipcRenderer.send(RENDERPROCESSCALL,{
                        type: GET_VIDEO_INFO,
                        params: { path: file.path }
                    })
                    setEditorState( preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-video', true, {name: file.name, path: file.path, size: file.size}));
                } else {
                    setEditorState( preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-file', true, {name: file.name, path: file.path, size: file.size}));
                }
            }
        }      
    }

    useEffect(() => {
        const listener = (event, params) => {
            const { fileType, data } = params
            console.log(fileType,data)
            sendMessages(fileType, data)
        }
        ipcRenderer.on("SELECT_FILES_CALLBACK", listener)
        return () => {
            ipcRenderer.off("SELECT_FILES_CALLBACK", listener)
        }
    }, [convId, convType])

    useEffect(() => {
        const listener = (event, params) => {
           setVideoInfos(pre => [...pre, params]);
        }
        ipcRenderer.on("GET_VIDEO_INFO_CALLBACK", listener)
        return () => {
            ipcRenderer.off("GET_VIDEO_INFO_CALLBACK", listener)
        }
    }, [convId, convType])

    console.log('videInfos',videoInfos)

    useEffect(() => {
        setEditorState(ContentUtils.clear(editorState))
    }, [convId, convType]);

    const shutUpStyle = isShutUpAll ? 'disabled-style' : '';
    const dragEnterStyle = isDraging ? 'draging-style' : '';

    return (
        <div className={`message-input ${shutUpStyle} ${dragEnterStyle}`} onDrop={handleDropFile} onKeyUp={ handleOnkeyPress} onDragLeaveCapture={handleDragLeave} onDragOver={handleDragEnter} >
            {
                atPopup && <AtPopup callback={(userId, name) => onAtPopupCallback(userId, name)} atUserNameInput={atUserNameInput} group_id={convId} />
            }
            <div className="message-input__feature-area">
                {
                    isEmojiPopup && <EmojiPopup callback={onEmojiPopupCallback} />
                }
                {
                    shouldShowCallMenu && <Menu options={[{text: '语音通话', id: '1' }, {text: '视频通话', id: '2' }]} onSelect={handleCallMenuClick}/>
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
            <div className="message-input__text-area">
                <BraftEditor
                    stripPastedStyles
                    //@ts-ignore
                    disabled={isShutUpAll}
                    onChange={editorChange}
                    value={editorState}
                    media={{ pasteImage:false }} // 不知道为什么 如果不设置items这个属性 会出现粘贴一次插入两个图片的问题
                    ref={instance => editorInstance = instance}
                    handlePastedFiles={handlePastedFiles}
                    handlePastedText={handlePastedText}
                    blockRendererFn={blockRendererFn}
                    contentStyle={{ height: '100%', fontSize: 14 }}
                    converts={{ blockExportFn }}
                    placeholder={placeHolderText}
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