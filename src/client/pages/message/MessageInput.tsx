import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, message } from 'tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendVideoMsg, sendMsg } from './api'
import { updateMessages } from '../../store/actions/message'
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
import { bufferToBase64Url, fileImgToBase64Url, getMessageElemArray, getPasteText } from './message-input-util';
  
type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    handleOpenCallWindow: (callType: string,convType:number,windowType:string) => void;
}

const SUPPORT_IMAGE_TYPE = ['png', 'jpg', 'gif', 'PNG', 'JPG', 'GIF','jpeg'];
const SUPPORT_VIDEO_TYPE = ['MP4', 'MOV', 'mp4', 'mov'];

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
    const [ isZHCNAndFirstPopup, setIsZHCNAndFirstPopup]  = useState(false);

    const { userId } = useSelector((state: State.RootState) => state.userInfo);

    const dispatch = useDispatch();
    const placeHolderText = isShutUpAll ? '已全员禁言' : '请输入消息';
    let editorInstance;

    const handleSendMsg = async () => {
        try {
            const rawData = editorState.toRAW();

            const messageElementArray = getMessageElemArray(rawData, videoInfos);

            if(messageElementArray.length) {
                const fetchList = messageElementArray.map((v => {
                    if(v.elem_type === 0) {
                        const atList = getAtList(v.text_elem_content);
                        return  sendMsg({
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

                setEditorState(ContentUtils.clear(editorState));

                const results = await Promise.all(fetchList);
                for(const res of results) {
                    const { data: {code, json_params, desc }} = res;
                    if (code === 0) {                
                        dispatch(updateMessages({
                            convId,
                            message: JSON.parse(json_params)
                        }))
                    }
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
        const atNameList =  list ? list.map(v => v.slice(1)) : [];
        return atNameList.map(v => atUserMap[v]);
    }

    
    const setFile = async (file: File | {size: number; type: string; path: string; name: string; fileContent: string}) => {
        if(file) {
            const fileSize = file.size;
            const type = file.type;
            const size = file.size;
            console.log('file',file)
            if(size === 0){
                message.error({content: "文件大小异常"})
                return
            }
            if (SUPPORT_IMAGE_TYPE.find(v => type.includes(v))) {
                if(fileSize > 28 * 1024 * 1024) return message.error({content: "image size can not exceed 28m"})
                const imgUrl = file instanceof File ? await fileImgToBase64Url(file) : bufferToBase64Url(file.fileContent, type);
                setEditorState( preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-image', true, { name: file.name, path: file.path, size: file.size, base64URL: imgUrl }));
            } else if (SUPPORT_VIDEO_TYPE.find(v=> type.includes(v))){
                if(fileSize > 100 * 1024 * 1024) return message.error({content: "video size can not exceed 100m"})
                ipcRenderer.send(RENDERPROCESSCALL,{
                    type: GET_VIDEO_INFO,
                    params: { path: file.path }
                })
                setEditorState( preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-video', true, {name: file.name, path: file.path, size: file.size}));
            } else {
                if(fileSize > 100 * 1024 * 1024) return message.error({content: "file size can not exceed 100m"})
                setEditorState( preEditorState => ContentUtils.insertAtomicBlock(preEditorState, 'block-file', true, {name: file.name, path: file.path, size: file.size}));
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
                extensions: SUPPORT_IMAGE_TYPE,
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
                extensions: SUPPORT_VIDEO_TYPE,
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

    const onAtPopupCallback = (userId: string, userName: string) => {
        resetState()
        if (userId) {
            const atText = userName || userId;
            setAtUserMap(pre => ({...pre, [atText]: userId}));
            setEditorState(ContentUtils.insertText(editorState, `${atText} `));
            setAtInput('');
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
        /**
         * 中文输入法下会触发两次change 第一次change时无法拿到真正的输入内容 
         * 用isZHCNAndFirstPopup字段判断是否中文输入法下按下@ 并且首次change
         */
        if(!hasAt && atPopup && !isZHCNAndFirstPopup) {
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
        const patseText = getPasteText(htmlString);
        setEditorState(ContentUtils.insertText(editorState, patseText))
    }

    const handlePastedFiles = (files: File[]) => {
        for (const file of files) {
            setFile(file);
        }    
        return 'handled';  
    }

    const handleKeyDown = (e) => {
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

    const keyBindingFn = (e) => {
        if(e.keyCode === 13 || e.charCode === 13) {
            e.preventDefault();
            if(!atPopup){
                handleSendMsg();
            }
            return 'enter';
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
        switch(e) {
            case 'enter': {
                return 'not-handled';
            }
            case '@' : {
                return 'not-handled';
            }
            case 'zh-cn-@': {
                return 'not-handled';
            }
        }
    }

    useEffect(() => {
        const listener = (event, params) => {
            const { triggerType, data } = params;
            switch(triggerType) {
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
        const errorConsole =(event, data) => {
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
            <div className="message-input__text-area" onKeyDown={handleKeyDown}>
                <BraftEditor
                    stripPastedStyles
                    //@ts-ignore
                    disabled={isShutUpAll}
                    onChange={editorChange}
                    value={editorState}
                    media={{ pasteImage:false }}
                    ref={instance => editorInstance = instance}
                    // handlePastedFiles={handlePastedFiles}
                    // handlePastedText={handlePastedText}
                    blockRendererFn={blockRendererFn}
                    keyBindingFn={keyBindingFn}
                    handleKeyCommand={handleKeyCommand}
                    contentStyle={{ height: '100%', fontSize: 14 }}
                    converts={{ blockExportFn }}
                    placeholder={placeHolderText}
                    draftProps={{ handlePastedFiles, handlePastedText, handleDroppedFiles: () => 'handled'}}
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