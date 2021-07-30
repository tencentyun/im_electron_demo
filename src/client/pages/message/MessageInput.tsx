import React, { useEffect, useState } from 'react';
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
import { setPathToLS } from '../../utils/messageUtils';
import { blockRendererFn, blockImportFn, blockExportFn } from './CustomBlock';
  
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
}, {
    id: 'phone'
}]
const FEATURE_LIST_C2C = [{
    id: 'face',
}, {
    id: 'photo'
}, {
    id: 'file'
}, {
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
    const [ editorState, setEditorState ] = useState<EditorState>(BraftEditor.createEditorState(null, {blockImportFn, blockExportFn}))
    const { userId } = useSelector((state: State.RootState) => state.userInfo);
    const [ filePathAndBase64Map, setFilePathAndBase64Map] = useState({});

    const filePicker = React.useRef(null);
    const imagePicker = React.useRef(null);
    const videoPicker = React.useRef(null);
    const soundPicker = React.useRef(null);
    const dispatch = useDispatch();
    const placeHolderText = isShutUpAll ? '已全员禁言' : '请输入消息';
    let editorInstance;

    const handleSendTextMsg = async () => {
        try {
            const text = editorState.toText()
            const atList = getAtList(text)
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
            setEditorState(ContentUtils.clear(editorState))
        } catch (e) {
            message.error({ content: `出错了: ${e.message}` })
        }
    }

    const handleSendMsg = async () => {
        try {
            const text = editorState.toText();
            const htmlText = editorState.toHTML();
            const imgSrcList = getImageSrcList(htmlText);
            const element = createElement(htmlText);
            const videosInfo = getCustomBlocksInfo(element, '.block-video', 'data-block-video');
            const otherFilesInfo = getCustomBlocksInfo(element, '.block-file', 'data-block-file');
        
            const atList = getAtList(text);
    
            const messageElementArray = [];
            const trimedText = text.trim();
            if(trimedText.length) {
                messageElementArray.push({
                    elem_type: 0,
                    text_elem_content: text,
                });
            }
            if(imgSrcList?.length) {
                messageElementArray.push( ...imgSrcList?.map(v => ({
                    elem_type: 1,
                    image_elem_orig_path: filePathAndBase64Map[v],
                    image_elem_level: 0
                })));
            }

            if(videosInfo?.length) {
                messageElementArray.push(...videosInfo?.map(v => ({
                    elem_type: 9,
                    video_elem_video_type: "MP4",
                    video_elem_video_size: v.size,
                    video_elem_video_duration: 10,
                    video_elem_video_path: v.path,
                    video_elem_image_type: "png",
                    video_elem_image_size: 10000,
                    video_elem_image_width: 200,
                    video_elem_image_height: 80,
                    video_elem_image_path: "./cover.png"

                    
                    // elem_type: 4,
                    // file_elem_file_path: v.path,
                    // file_elem_file_name: v.name,
                    // file_elem_file_size: v.size
                })))
            }
            if(otherFilesInfo?.length) {
                messageElementArray.push(...otherFilesInfo?.map(v => ({
                    elem_type: 4,
                    file_elem_file_path: v.path,
                    file_elem_file_name: v.name,
                    file_elem_file_size: v.size
                })))
            }

            const { data: { code, json_params, desc } } = await sendMsg({
                convId,
                convType,
                messageElementArray,
                userId,
                messageAtArray: atList
            });

            if (code === 0) {                
                dispatch(reciMessage({
                    convId,
                    messages: [JSON.parse(json_params)]
                }));
            }
            setEditorState(ContentUtils.clear(editorState));
        } catch (e) {
            message.error({ content: `出错了: ${e.message}` });
        }
        setFilePathAndBase64Map({});
    }

    const getAtList = (text: string) => {
        const list = text.match(/@\w+/g);
        return list ? list.map(v => v.slice(1)) : []
    }

    // 从html字符串中匹配出image标签src
    const getImageSrcList =(text: string) => {
        //匹配图片（g表示匹配所有结果i表示区分大小写）
        var imgReg = /<img.*?(?:>|\/>)/gi;
        //匹配src属性 
        var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        var arr = text.match(imgReg);// 匹配出所有的img标签
        const srcList = arr?.map(v => {
            const srcs = v.match(srcReg);
            if(srcs) {
                return srcs[1];
            }
        }) || [];
       return srcList;
    }

    const createElement = (htmlString: string) => {
        const currentDiv = document.createElement('div');
        currentDiv.innerHTML = htmlString;
        return currentDiv;
    }

    // 从html字符串中匹配出所需节点上的信息
    const getCustomBlocksInfo =(element: Element, selector, customAttribute: string) => {
        const childElements = element.querySelectorAll(selector)
        const customBlocksInfo = [];
        childElements.forEach((v) => {
            console.log('v', v)
            const value = v.innerHTML;
            customBlocksInfo.push(JSON.parse(value));
        })
        return customBlocksInfo;
    }

    const handleDropFile = (e) => {
        const file = e.dataTransfer?.files[0]
        const iterator = file.type.matchAll(/(\w+)\//g)
        const type = iterator.next().value[1]
        setDraging(false);
        switch(type) {
            case "image":
                sendImageMessage(file)
                break
            case "audio":
                sendSoundMessage(file)
                break
            case "video":
                sendVideoMessage(file)
                break
            default:
                sendFileMessage(file)
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
        // soundPicker.current.click();
        setRecordPopup(true)
    }
    const handleSendFileMessage = () => {
        filePicker.current.click();
    }
    const handleSendVideoMessage = () => {
        videoPicker.current.click();
    }
    const sendImageMessage = async (file) => {
        if(!file) return false;
        if (file) {
            const { data: { code, desc, json_params } } = await sendImageMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 1,
                    image_elem_orig_path: file.path,
                    image_elem_level: 0
                }],
                userId,
            });
            if (code === 0) {
                dispatch(reciMessage({
                    convId,
                    messages: [JSON.parse(json_params)]
                }))
            } else {
                message.error({content: `消息发送失败 ${desc}`})
            }
        }
    }

    const sendFileMessage = async (file) => {
        if(!file) return false;
        const { data: { code, desc, json_params } } = await sendFileMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 4,
                file_elem_file_path: file.path,
                file_elem_file_name: file.name,
                file_elem_file_size: file.size
            }],
            userId,
        });
        console.log(file,1111)
        if (code === 0) {
            dispatch(updateMessages({
                convId,
                message: JSON.parse(json_params)
            }))
            setPathToLS(file.path)
        } else {
            message.error({content: `消息发送失败 ${desc}`})
        }
    }

    const sendVideoMessage = async (file) => {
        if(!file) return false;
        const { data: { code, json_params, desc } } = await sendVideoMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 9,
                video_elem_video_type: "MP4",
                video_elem_video_size: file.size,
                video_elem_video_duration: 10,
                video_elem_video_path: file.value,
                video_elem_image_type: "png",
                video_elem_image_size: 10000,
                video_elem_image_width: 200,
                video_elem_image_height: 80,
                video_elem_image_path: "./cover.png"
            }],
            userId,
        });
        if (code === 0) {
            dispatch(reciMessage({
                convId,
                messages: [JSON.parse(json_params)]
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
                handleSendPhotoMessage()
                break;
            case "file":
                handleSendFileMessage()
                break;
            case "voice":
                handleSendSoundMessage()
                break;
            case "phone":
                handleSendPhoneMessage()
            break;
            case "more":
            // handleSendMoreMessage()

        }
        setActiveFeature(featureId);
    }

    const handleOnkeyPress = (e) => {
        if (e.keyCode == 13 || e.charCode === 13) {
            e.preventDefault();
            handleSendTextMsg();
        } else if(e.key === "@" && convType === 2) {
            e.preventDefault();
            setAtPopup(true)
        } 
    }

    const onAtPopupCallback = (userName) => {
        resetState()
        if (userName) {
            setEditorState(ContentUtils.insertText(editorState, `@${userName} `))
        }
    }

    const onEmojiPopupCallback = (id) => {
        resetState()
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

    }

    // 得到图片的base64
    const createImgUrl = async (file:File) => {
        return new Promise(res => {
            const reader = new FileReader();
            // 传入一个参数对象即可得到基于该参数对象的文本内容
            reader.readAsDataURL(file);
            reader.onload = function (e) {
              const base64Value = e.target.result;
              // target.result 该属性表示目标对象的DataURL
              // @ts-ignore
              setFilePathAndBase64Map(pre => ({...pre, [base64Value]: file.path}))
              res(base64Value)
            };
        })
          
    }

    const handlePastedText = (text: string, htmlString: string) => {
        if(text) {
            setEditorState(ContentUtils.insertText(editorState, text));
        }
    }

    const handlePastedFiles = async (files: File[]) => {
        console.log('files', files);
        if (files?.length) {
            files.forEach(async file => {
                if (!file?.path?.length) return;
                const type = file.type;
                if (type.includes('image')) {
                    const imgUrl = await createImgUrl(file);
                    setEditorState(ContentUtils.insertMedias(editorState, [{
                        type: 'IMAGE',
                        url: imgUrl
                    }]));
                    return;
                } else if ( type.includes('video')){
                     setEditorState(ContentUtils.insertAtomicBlock(editorState, 'block-video', true, {name: file.name, path: file.path, size: file.size}));
                } else {
                    setEditorState(ContentUtils.insertAtomicBlock(editorState, 'block-file', true, {name: file.name, path: file.path, size: file.size}));
                }


                // editorInstance.setContent(insertHtmlString, 'html')
                // setEditorState(ContentUtils.insertAtomicBlock(editorState, 'my-block-img', true));
                // setEditorState(ContentUtils.insertHTML(editorState, insertHtmlString, null));
           })

        }
    }

    useEffect(() => {
        setEditorState(ContentUtils.clear(editorState))
    }, [convId, convType]);

    const shutUpStyle = isShutUpAll ? 'disabled-style' : '';
    const dragEnterStyle = isDraging ? 'draging-style' : '';

    return (
        <div className={`message-input ${shutUpStyle} ${dragEnterStyle}`} onDrop={handleDropFile} onKeyPress={ handleOnkeyPress} onDragLeaveCapture={handleDragLeave} onDragOver={handleDragEnter} >
            {
                atPopup && <AtPopup callback={(name) => onAtPopupCallback(name)} group_id={convId} />
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
                    converts={{ blockImportFn, blockExportFn }}
                    placeholder={placeHolderText}
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendMsg} disabled={editorState.toText() === ''}>发送</Button>
            </div>
            {
                isRecordPopup && <RecordPopup onSend={handleRecordPopupCallback} onCancel={() => setRecordPopup(false)} />
            }
            {/* <Modal caption="真的发这个图片吗" onClose={close}>
                <Modal.Body>真的发这个图片吗</Modal.Body>
                <Modal.Footer>
                    <Button type="primary" onClick={close}>
                        确定
                    </Button>
                    <Button type="weak" onClick={close}>
                        取消
                    </Button>
                </Modal.Footer>
            </Modal> */}
            <input ref={filePicker} onChange={e =>sendFileMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
            <input ref={imagePicker} onChange={e => sendImageMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
            <input ref={videoPicker} onChange={e => sendVideoMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
            <input ref={soundPicker} onChange={e => sendSoundMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
        </div>
    )

}