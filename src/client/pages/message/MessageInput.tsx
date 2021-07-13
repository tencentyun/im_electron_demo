import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../store/actions/message';

import { TextArea, Button } from '@tencent/tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendSoundMsg, sendVideoMsg } from './api'
import { reciMessage } from '../../store/actions/message'

import './message-input.scss';

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
    const [ isShownAtPopup, setShownAtPopup ] = useState(false);
    const [ atList, setAtList ] = useState([]);
    const { userId } = useSelector((state: State.RootState) => state.userInfo);

    const [text, setText] = useState("");
    const dispatch = useDispatch();
    const filePicker = React.useRef(null);
    const imagePicker = React.useRef(null);
    const videoPicker = React.useRef(null);
    const soundPicker = React.useRef(null);

    const handleSendTextMsg = async () => {
        const { data: { code, json_params } } = await sendTextMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 0,
                text_elem_content: text,
            }],
            userId,
        });

        const sendedMsg = JSON.parse(json_params);

        if(code === 0) {
            dispatch(reciMessage({
                convId,
                messages: [sendedMsg]
            }))
            setText("");
        }
    }

    const handleSendPhotoMessage = () => {
        imagePicker.current.click();
    }
    const handleSendSoundMessage = () => {
        soundPicker.current.click();
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
            // const fileReader = new FileReader();
            // fileReader.readAsDataURL(image);
            // fileReader.onload = () => {
            //     fileReader.result
            // }

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
            console.log(code, desc, json_params, image.path)
            if(code === 0) {
                dispatch(reciMessage({
                    convId,
                    messages: JSON.parse(json_params)
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

        console.log(code, desc, json_params, file.path)
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
                video_elem_video_path: video.value
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
                sound_elem_file_time: 10
            }],
            userId,
        });
    }

    const handleSendAtMessage = async() => {
        setShownAtPopup(true)
    }

    const handleFeatureClick = (featureId) => {
        switch(featureId) {
            case "face":
                // handleSendFaceMessage()
            case "at":
                handleSendAtMessage()
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
        console.log(featureId);
    }

    const handleOnkeyPress = (e) => {
        if(e.keyCode == 13 || e.charCode ===13) {
            e.preventDefault();
            handleSendTextMsg();
        }
    }


    return (
        <div className="message-input">
            <div className="message-input__feature-area">
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
                <TextArea
                    showCount={false}
                    size='full'
                    value={text}
                    onChange={(value, context) => {
                        setText(value);
                    }}
                    placeholder="请输入消息"
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendTextMsg} disabled={text === ''}>发送</Button>
            </div>
            <div>

            </div>
            <input ref={filePicker} onChange={sendFileMessage} type="file" style={{ display:'none'}} />
            <input ref={imagePicker} onChange={sendImageMessage} type="file" style={{ display:'none'}} />
            <input ref={videoPicker} onChange={sendVideoMessage} type="file" style={{ display:'none'}} />
            <input ref={soundPicker} onChange={sendSoundMessage} type="file" style={{ display:'none'}} />
        </div>
    )


}