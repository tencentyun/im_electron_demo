import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../store/actions/message';

import { TextArea, Button, message, Modal } from '@tencent/tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendSoundMsg, sendVideoMsg } from './api'
import { reciMessage } from '../../store/actions/message'
import { emojiMap, emojiName, emojiUrl } from './emoji-map'
import { AtPopup } from './components/atPopup'
import { EmojiPopup } from './components/emojiPopup'

import './message-input.scss';
import ReactDOM from 'react-dom';
import { RecordPopup } from './components/recordPopup';
import BraftEditor, { ControlType, EditorState } from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css'

type Props = {
    convId: string,
    convType: number
}

const FEATURE_LIST = [{
    id: 'face',
},{
    id: 'at',
},{
    id: 'photo'
}, {
    id: 'file'
}, {
    id: 'voice'
}, {
    id: 'phone'
}, {
    id: 'more'
}]

export const MessageInput = (props: Props) : JSX.Element => {
    const { convId, convType } = props;
    const [ activeFeature, setActiveFeature ] = useState('');
    const [ isAtPopup, setAtPopup ] = useState(false);
    const [ isEmojiPopup, setEmojiPopup ] = useState(false);
    const [ isRecordPopup, setRecordPopup ] = useState(false);
    const [ editorState, setEditorState ] = useState<EditorState>(BraftEditor.createEditorState(null))
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
            const { data: { code, json_params } } = await sendTextMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 0,
                    text_elem_content: editorState.toText(),
                }],
                userId,
                messageAtArray: atList
            });
    
            if(code === 0) {
                dispatch(reciMessage({
                    convId,
                    messages: [JSON.parse(json_params)]
                }))
                setEditorState(ContentUtils.clear(editorState))
            }
        } catch(e) {
            message.error({ content: `出错了: ${e.message}`})
        }
    }
    const getAtList = (text: string) => {
        const list = text.match(/@\w+/g);
        return list ? list.map(v => v.slice(1)) : []
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
    const sendImageMessage = async(e) => {
        const image = e.target.files[0]

        if(image) {
            const { data: { code, desc, json_params } } = await sendImageMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 1,
                    image_elem_orig_path: image.path,
                    image_elem_level: 0
                }],
                userId,
            });
            if(code === 0) {
                dispatch(reciMessage({
                    convId,
                    messages: [JSON.parse(json_params)]
                }))
            }
        } 
    }

    const sendFileMessage = async(e) => {
        const file = e.target.files[0]
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

        if(code === 0) {
            dispatch(reciMessage({
                convId,
                messages: [JSON.parse(json_params)]
            }))
        }
    }

    const sendVideoMessage = async(e) => {
        const video = e.target.files[0]
        const { data: { code, json_params } } = await sendVideoMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 9,
                video_elem_video_type: "MP4",
                video_elem_video_size: video.size,
                video_elem_video_duration: 10,
                video_elem_video_path: video.value,
                video_elem_image_type: "png",
                video_elem_image_size: 10000,
                video_elem_image_width: 200,
                video_elem_image_height: 80,
                video_elem_image_path: "./cover.png"
            }],
            userId,
        });
    }

    const sendSoundMessage = async(e) => {
        const sound = e.target.files[0]
        const { data: { code, json_params } } = await sendSoundMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 2,
                sound_elem_file_path: sound.value,
                sound_elem_file_size: sound.size,
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
        console.log(featureId)
        switch(featureId) {
            case "face":
                handleSendFaceMessage()
                break;
            case "at":
                console.log("at")
                if(convType === 2) handleSendAtMessage()
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
            case "more":
                // handleSendMoreMessage()

        }
        setActiveFeature(featureId);
    }

    const handleOnkeyPress = (e) => {
        if(e.keyCode == 13 || e.charCode ===13) {
            e.preventDefault();
            handleSendTextMsg();
        }
    }

    const onAtPopupCallback = (userName) => {
        resetState()
        if(userName) {
            setEditorState(ContentUtils.insertText(editorState, `@${userName} `))
        }
    }

    const onEmojiPopupCallback = (id) => {
        resetState()
        if(id) {
            setEditorState(ContentUtils.insertText(editorState, id))
        }
    }

    const handleRecordPopupCallback = (path) => {
        resetState()
        if(path) {
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

    return (
        <div className="message-input">
            <div className="message-input__feature-area">
                {
                    isAtPopup && <AtPopup callback={onAtPopupCallback} group_id={convId}  />
                }
                {
                    isEmojiPopup && <EmojiPopup callback={onEmojiPopupCallback} />
                }
                {
                    FEATURE_LIST.map(({id}) => (
                        <span 
                            key={id} 
                            className={`message-input__feature-area--icon ${id} ${activeFeature === id ? 'is-active' : ''}`} 
                            onClick={() => handleFeatureClick(id)}
                        />
                    ))
                }
            </div>
            <div className="message-input__text-area" onKeyPress={handleOnkeyPress}>
                <BraftEditor
                    onChange={editorChange}
                    value={editorState}
                    controls={[]}
                    ref={instance => editorInstance = instance}
                    contentStyle={{height: '100%', fontSize: 14}}
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendTextMsg} disabled={editorState.toText() === ''}>发送</Button>
            </div>
            {
                isRecordPopup && <RecordPopup onSend={handleRecordPopupCallback} onCancel={() => setRecordPopup(false)} />
            }
            <Modal caption="真的发这个图片吗" onClose={close}>
                <Modal.Body>真的发这个图片吗</Modal.Body>
                <Modal.Footer>
                <Button type="primary" onClick={close}>
                    确定
                </Button>
                <Button type="weak" onClick={close}>
                    取消
                </Button>
                </Modal.Footer>
            </Modal>
            <input ref={filePicker} onChange={sendFileMessage} type="file" style={{ display:'none'}} />
            <input ref={imagePicker} onChange={sendImageMessage} type="file" style={{ display:'none'}} />
            <input ref={videoPicker} onChange={sendVideoMessage} type="file" style={{ display:'none'}} />
            <input ref={soundPicker} onChange={sendSoundMessage} type="file" style={{ display:'none'}} />
        </div>
    )

}