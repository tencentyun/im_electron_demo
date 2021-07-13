import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { TextArea, Button } from '@tencent/tea-component';
import { sendTextMsg, sendImageMsg } from './api'
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

    const handleSendPhotoMessage = async() => {
        const fileReader = FileReader();
        filePicker.current.click();

        const { data: { code, json_params } } = await sendImageMsg({
            convId,
            convType,
            messageElementArray: [{
                elem_type: 0,
                text_elem_content: text,
            }],
            userId,
        });
    }

    const handleFeatureClick = (featureId) => {
        switch(featureId) {
            case "face":
                handleSendFaceMessage()
            case "at":
                handleSendAtMessage()
            case "photo":
                handleSendPhotoMessage()
            case "file":
                handleSendFileMessage()
            case "voice":
                handleSendVoiceMessage()
            case "phone":
                handleSendPhoneMessage()
            case "more":
                handleSendMoreMessage()

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
            <input ref="filePicker" type="file" style={{ display:'none'}} />
        </div>
    )


}