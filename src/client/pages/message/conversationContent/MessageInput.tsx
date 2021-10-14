import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, message } from 'tea-component';
import {  sendMsg, getGroupMemberList } from '../../../api'
import { updateMessages } from '../../../store/actions/message'
import { AtPopup } from '../components/atPopup'
import { EmojiPopup } from '../components/emojiPopup'
import { RecordPopup } from '../components/recordPopup';
import { Menu } from '../../../components/menu';
import BraftEditor, { EditorState } from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css'
import '../scss/message-input.scss';
import { ipcRenderer, remote } from 'electron';
import { SUPPORT_IMAGE_TYPE } from '../../../../app/const/const';
import { blockRendererFn, blockExportFn } from './CustomBlock';
import { bufferToBase64Url, fileImgToBase64Url, getMessageElemArray, getPasteText, fileReaderAsBuffer, generateTemplateElement } from '../../../utils/message-input-util';
import { SUPPORT_VIDEO_TYPE,getVideoInfo, selectImageMessage, selectFileMessage, selectVideoMessage } from '../../../utils/tools';
  
type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    handleOpenCallWindow: (callType: string,convType:number,windowType:string) => void;
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
    title: '表情'
},{
    id: 'photo',
    title: '发送图片'
}, {
    id: 'file',
    title: '发送文件'
}
,{
    id: 'phone',
    title: '通话'
}, {
    id: 'screenShot',
    title: '截图 (shift+option+c)'
}]
const FEATURE_LIST_C2C = [{
    id: 'face',
    title: '表情'
},{
    id: 'photo',
    title: '发送图片'
}, {
    id: 'file',
    title: '发送文件'
}
,{
    id: 'phone',
    title: '通话'
}, {
    id: 'screenShot',
    title: '截图 (shift+option+c)'
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
    const [isAnalysizeVideo, setAnalysizeVideoInfoStatus ] = useState(false);
    const [ groupSenderProfile, setGroupSenderProfile ] = useState();

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
    const placeHolderText = isShutUpAll ? '已全员禁言' : '';
    let editorInstance;

    const handleSendMsg = async () => {
        try {
            if(isAnalysizeVideo) {
                message.warning({
                    content: "视频解析中, 无法发送!"
                });
                return;
            }
            const rawData = editorState.toRAW();

            const messageElementArray = getMessageElemArray(rawData, videoInfos);

            const sendMsgSuccessCallback = ([res, userData]) => {
                const { code, json_params, desc } = res;

                if (code === 0) {                
                    dispatch(updateMessages({
                        convId,
                        message: JSON.parse(json_params)
                    }))
                }
            };

            if(messageElementArray.length) {
                messageElementArray.map( async v => {
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
                        const templateElement = await generateTemplateElement(convId, convType, userProfile, messageId, v, groupSenderProfile) as State.message;
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

                    const templateElement = await generateTemplateElement(convId, convType, userProfile, messageId, v, groupSenderProfile) as State.message;
                    dispatch(updateMessages({
                        convId,
                        message: templateElement
                    }));
                });

                setEditorState(ContentUtils.clear(editorState));
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

    const filePathAdapter = async (file) => {
        let templateFile = file;
        if(templateFile.path === "") {
            const formatedFile = file instanceof File && await fileReaderAsBuffer(file);
            templateFile = formatedFile;
        }
        return templateFile;
    } 

    
    const setFile = async (file: File | {size: number; type: string; path: string; name: string; fileContent: string}) => {
        file = await filePathAdapter(file);
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
                getVideoInfo(file.path)
                setAnalysizeVideoInfoStatus(true);
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

    
    const selectSoundMessage = () => {
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
    const handleScreenShot = () => {
        const captureView = remote.getGlobal('captureView');
        captureView.open();
        console.log('========screenshot====')
    };
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
            case "screenShot":
                handleScreenShot()
                break;
            case "more":
                selectVideoMessage()
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

    const getGroupSenderProfile = async () => {
        const result = await getGroupMemberList({
            groupId: convId,
            userIds: userId.length ? [userId] : [],
            nextSeq: 0,
        });

        const memberList = result ? result.group_get_memeber_info_list_result_info_array || [] : [];

        const currentUserSetting: any = memberList?.[0] || {};
        setGroupSenderProfile(currentUserSetting);
    }

    useEffect(() => {
        // setGroupSenderProfile(undefined);
        // convType === 2 && getGroupSenderProfile();
        setEditorState(ContentUtils.clear(editorState))
        setAnalysizeVideoInfoStatus(false);
        const listener = (event, params) => {
            const { triggerType, data } = params;
            switch(triggerType) {
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
        const errorConsole =(event, data) => {
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

                    FEATURE_LIST[convType].map(({ id, title }) => (
                        <span
                            key={id}
                            className={`message-input__feature-area--icon ${id} ${activeFeature === id ? 'is-active' : ''}`}
                            onClick={() => handleFeatureClick(id)}
                            title={title}
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
                <Button type="primary" onClick={handleSendMsg} disabled={editorState.toText() === '' || isAnalysizeVideo}>发送</Button>
            </div>
            {
                isRecordPopup && <RecordPopup onSend={handleRecordPopupCallback} onCancel={() => setRecordPopup(false)} />
            }
        </div>
    )

}