import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, message, Bubble } from 'tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendSoundMsg, sendVideoMsg } from './api'
import { reciMessage } from '../../store/actions/message'
import { AtPopup } from './components/atPopup'
import { EmojiPopup } from './components/emojiPopup'
import { RecordPopup } from './components/recordPopup';
import BraftEditor, { EditorState } from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css'
import './message-input.scss';
import { ipcRenderer, clipboard } from 'electron'
type Props = {
    convId: string,
    convType: number
}

const FEATURE_LIST_GROUP = [{
    id: 'face',
    content: '发表情'
}, {
    id: 'at',
    content: '@其他人'
}, {
    id: 'photo',
    content: '发图片'
}, {
    id: 'file',
    content: '发文件'
}, {
    id: 'phone',
    content: '语音'
}, {
    id: 'screen-shot',
    content: '截图(Ctrl + Alt + C)'
}, {
    id: 'more',
    content: '更多'
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
}, {
    id: 'phone',
    content: '语音'
}, {
    id: 'screen-shot',
    content: '截图(Ctrl + Alt + C)'
}, {
    id: 'more',
    content: '更多'
}]
const FEATURE_LIST = {
    1: FEATURE_LIST_C2C, 2: FEATURE_LIST_GROUP
}
export const MessageInput = (props: Props): JSX.Element => {
    const { convId, convType } = props;
    const [activeFeature, setActiveFeature] = useState('');
    const [atPopup, setAtPopup] = useState(false);
    const [isEmojiPopup, setEmojiPopup] = useState(false);
    const [isRecordPopup, setRecordPopup] = useState(false);
    const [editorState, setEditorState] = useState<EditorState>(BraftEditor.createEditorState(null))
    const { userId } = useSelector((state: State.RootState) => state.userInfo);
    const filePicker = React.useRef(null);
    const imagePicker = React.useRef(null);
    const videoPicker = React.useRef(null);
    const soundPicker = React.useRef(null);
    const dispatch = useDispatch();
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
                setEditorState(ContentUtils.clear(editorState))
            } else {
                message.error({ content: `消息发送失败 ${desc}` })
            }
        } catch (e) {
            message.error({ content: `出错了: ${e.message}` })
        }
    }
    const getAtList = (text: string) => {
        const list = text.match(/@\w+/g);
        return list ? list.map(v => v.slice(1)) : []
    }
    const handleDropFile = (e) => {
        const file = e.dataTransfer?.files[0]
        const iterator = file.type.matchAll(/(\w+)\//g)
        const type = iterator.next().value[1]
        switch (type) {
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
        console.log(file, '发送文件')
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
                message.error({ content: `消息发送失败 ${desc}` })
            }
        }
    }

    const sendFileMessage = async (file) => {
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

        if (code === 0) {
            dispatch(reciMessage({
                convId,
                messages: [JSON.parse(json_params)]
            }))
        } else {
            message.error({ content: `消息发送失败 ${desc}` })
        }
    }

    const sendVideoMessage = async (file) => {
        if (file) {
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
                message.error({ content: `消息发送失败 ${desc}` })
            }
        }
    }

    const sendSoundMessage = async (file) => {
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
                // handleSendPhoneMessage()
                break;
            case "more":
                // handleSendMoreMessage(),
                break;
            case "screen-shot":
                handleScreenShot()
                break;

        }
        setActiveFeature(featureId);
    }

    const handleScreenShot = () => {
        console.log('点击了截图按钮')
        clipboard.clear()
        ipcRenderer.send('SCREENSHOT')
    }
    const handleOnkeyPress = (e) => {
        console.log(1111, convType)
        if (e.keyCode == 13 || e.charCode === 13) {
            e.preventDefault();
            handleSendTextMsg();
        } else if (e.key === "@" && convType === 2) {
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

    const resetState = () => {
        setAtPopup(false)
        setEmojiPopup(false)
        setRecordPopup(false)
        setActiveFeature("")
    }

    const editorChange = (editorState) => {
        setEditorState(editorState)
    }

    useEffect(() => {
        setEditorState(ContentUtils.clear(editorState))
    }, [convId, convType])

    useEffect(() => {
        ipcRenderer.on('screenShotUrl', (e, { data, url }) => {
            if (data.length == 0) {
                message.error({ content: '已取消截图' })
            } else {
                const file = new File([data], new Date().getTime() + 'screenShot.png', { type: 'image/jpeg' })
                // console.log(file, '截图文件对象')
                const fileObj = {
                    lastModified: file.lastModified,
                    lastModifiedDate: file.lastModifiedDate,
                    name: file.name,
                    path: url,
                    size: file.size,
                    type: file.type,
                    webkitRelativePath: file.webkitRelativePath
                }
                // console.log(fileObj, '截图文件对象', file)
                sendImageMessage(fileObj)
                return
            }
        })
    }, [])

    useEffect(() => {
        return () => {
            ipcRenderer.removeAllListeners('screenShotUrl')
        }
    }, [])
    return (
        <div className="message-input">
            {
                atPopup && <AtPopup callback={(name) => onAtPopupCallback(name)} group_id={convId} />
            }
            <div className="message-input__feature-area">
                {
                    isEmojiPopup && <EmojiPopup callback={onEmojiPopupCallback} />
                }
                {

                    FEATURE_LIST[convType].map(({ id, content }) => (
                        <Bubble content={content}>
                            <span
                                key={id}
                                className={`message-input__feature-area--icon ${id} ${activeFeature === id ? 'is-active' : ''}`}

                                onClick={() => handleFeatureClick(id)}
                            >
                            </span>
                        </Bubble>

                    ))
                }
            </div>
            <div className="message-input__text-area" onDrop={handleDropFile} onDragOver={e => e.preventDefault()} onKeyPress={handleOnkeyPress}>
                <BraftEditor
                    onChange={editorChange}
                    value={editorState}
                    controls={[]}
                    ref={instance => editorInstance = instance}
                    contentStyle={{ height: '100%', fontSize: 14 }}
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendTextMsg} disabled={editorState.toText() === ''}>发送</Button>
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
            <input ref={filePicker} onChange={e => sendFileMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
            <input ref={imagePicker} onChange={e => sendImageMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
            <input ref={videoPicker} onChange={e => sendVideoMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
            <input ref={soundPicker} onChange={e => sendSoundMessage(e.target.files[0])} type="file" style={{ display: 'none' }} />
        </div>
    )

}