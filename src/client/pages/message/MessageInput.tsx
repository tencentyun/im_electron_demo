import React, {useState} from 'react';
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
    const { userId } = useSelector((state: State.RootState) => state.userInfo);

    const [text, setText] = useState("");
    const dispatch = useDispatch();
    const filePicker = React.useRef(null);

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
        filePicker.current.click();
    }
    const handleSendSoundMessage = () => {
        filePicker.current.click();
    }
    const handleSendFileMessage = () => {
        filePicker.current.click();
    }
    const handleSendVideoMessage = () => {
        filePicker.current.click();
    }

    const sendImageMessage = async(e) => {
        const image = e.target.files[0]

        if(image) {
            // const fileReader = new FileReader();
            // fileReader.readAsDataURL(image);
            // fileReader.onload = () => {
            //     fileReader.result
            // }

            const { data: { code, json_params } } = await sendImageMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 0,
                    image_elem_orig_path: image.value,
                    image_elem_level: 0
                }],
                userId,
            });

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
        const { data: { code, json_params } } = await sendFileMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 0,
                file_elem_file_path: file.value,
                file_elem_file_name: file.name,
                file_elem_file_size: file.size
            }],
            userId,
        });
    }

    const sendVideoMessage = async(e) => {
        const video = e.target.files[0]
        const { data: { code, json_params } } = await sendVideoMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 0,
                video_elem_video_type: "MP4",
                video_elem_video_size: 100000,
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
                elem_type: 0,
                sound_elem_file_path: sound.value,
                sound_elem_file_size: 100000,
                sound_elem_file_time: 10
            }],
            userId,
        });
    }

    const handleSendAtMessage = async() => {

    }

    const handleFeatureClick = (featureId) => {
        switch(featureId) {
            case "face":
                // handleSendFaceMessage()
            case "at":
                handleSendAtMessage()
            case "photo":
                handleSendPhotoMessage()
            case "file":
                handleSendFileMessage()
            case "voice":
                handleSendSoundMessage()
            case "phone":
                // handleSendPhoneMessage()
            case "more":
                // handleSendMoreMessage()

        }
        setActiveFeature(featureId);
        console.log(featureId);
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
            <div className="message-input__text-area">
                <TextArea
                    showCount={false}
                    size='full'
                    value={text}
                    onChange={(value, context) => {
                        setText(value);
                        console.log(value, context);
                    }}
                    placeholder="请输入消息"
                />
            </div>
            <div className="message-input__button-area">
                <Button type="primary" onClick={handleSendTextMsg} disabled={text === ''}>发送</Button>
            </div>
            <input ref={filePicker} onChange={sendFileMessage} type="file" style={{ display:'none'}} />
            <input ref={filePicker} onChange={sendImageMessage} type="file" style={{ display:'none'}} />
            <input ref={filePicker} onChange={sendVideoMessage} type="file" style={{ display:'none'}} />
            <input ref={filePicker} onChange={sendSoundMessage} type="file" style={{ display:'none'}} />
        </div>
    )


}