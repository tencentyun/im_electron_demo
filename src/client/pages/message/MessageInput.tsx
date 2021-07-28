import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, message, Bubble, Dropdown, List } from 'tea-component';
import { sendTextMsg, sendImageMsg, sendFileMsg, sendSoundMsg, sendVideoMsg } from './api'
import { reciMessage, updateMessages } from '../../store/actions/message'
import { AtPopup } from './components/atPopup'
import { EmojiPopup, CUSTEMOJI } from './components/emojiPopup'
import { RecordPopup } from './components/recordPopup';
import BraftEditor, { EditorState } from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css'
import './message-input.scss';
import { ipcRenderer, clipboard } from 'electron'
import chooseImg from '../../assets/icon/choose.png'
import { string } from 'prop-types';
import axios from "axios";
import { convertBase64UrlToBlob } from "../../utils/tools";
import { SDKAPPID, TIM_BASE_URL } from '../../constants/index'
import { setPathToLS } from '../../utils/messageUtils';

let store = '1'

type Props = {
    convId: string,
    convType: number,
    isShutUpAll: boolean,
    editorState,
    setEditorState
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
    id: 'video',
    content: '发视频'
}, {
    id: 'phone',
    content: '语音'
}, {
    id: 'screen-shot',
    content: '截图(Ctrl + Shift + X)'
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
    id: 'video',
    content: '发视频'
}, {
    id: 'phone',
    content: '语音'
}, {
    id: 'screen-shot',
    content: '截图(Ctrl + Shift + X)'
}, {
    id: 'more',
    content: '更多'
}]
const FEATURE_LIST = {
    1: FEATURE_LIST_C2C, 2: FEATURE_LIST_GROUP
}

export const MessageInput = (props: Props): JSX.Element => {
    const { convId, convType, isShutUpAll, editorState, setEditorState } = props;
    const [isDraging, setDraging] = useState(false);
    const [activeFeature, setActiveFeature] = useState('');
    const [atPopup, setAtPopup] = useState(false);
    const [isEmojiPopup, setEmojiPopup] = useState(false);
    const [isRecordPopup, setRecordPopup] = useState(false);
    const [shotKeyTip, setShotKeyTip] = useState('按Enter键发送消息');
    const [isTextNullEmpty, setIsTextNullEmpty] = useState(true);
    // const [ editorState, setEditorState ] = useState<EditorState>(BraftEditor.createEditorState(null))
    const { userId } = useSelector((state: State.RootState) => state.userInfo);
    const filePicker = React.useRef(null);
    const imagePicker = React.useRef(null);
    const videoPicker = React.useRef(null);
    const soundPicker = React.useRef(null);
    const dispatch = useDispatch();
    const placeHolderText = isShutUpAll ? '已全员禁言' : '请输入消息';
    const [sendType, setSendType] = useState(null);
    let editorInstance;
    // const enterSend = localStorage.getItem('sendType') || '1'

    // 上传逻辑
    const handleUpload = (base64Data) => {
        return new Promise((resolve, reject) => {
            axios
                .post(`${TIM_BASE_URL}/v4/im_cos_msg/pre_sig`, {
                    sdkappid: SDKAPPID,
                    uid: "tetetetetetet",
                    file_type: 1,
                    file_name: "headUrl/" + new Date().getTime() + 'screenShot.png',
                    Duration: 900,
                    upload_method: 0,
                })
                .then((res) => {
                    console.log(res);
                    const { upload_url } = res.data;
                    console.log(111111);
                    console.log(upload_url);
                    let fr = new FileReader();
                    axios
                        .put(upload_url, convertBase64UrlToBlob(base64Data), {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                        })
                        .then(() => {
                            const { download_url } = res.data;
                            resolve(res.data.ci_url)
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

    const handleSendTextMsg = async () => {
        console.warn(editorState?.toHTML())

        if (editorStateDisabled(editorState)) {
            return
        }
        let toTextContent = editorState?.toText()

        const htmlText = editorState.toHTML();
        const imgSrc = htmlText.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/g)

        try {
            if (imgSrc && imgSrc.length > 0) {
                let formatText = [];
                let textContent = htmlText.match(/<p>((\w|\W)*?)<\/p>/g)
                if (textContent && textContent.length > 0) {
                    formatText = textContent.map(item => {
                        return item.replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/<br\/>/g, '\n')
                    });
                }
                // imgSrc.forEach(async (i,index)=>{
                //     await handleUpload(i.replace(/<img src=/,'').replace(/\/>/,'').replace(/"/g,'')).then(src=>{
                //         formatText.splice((index * 2)+1,0,`<img src="${src}" />`)
                //     })
                //     // aaa(i.replace(/<img src=/,'').replace(/\/>/,'').replace(/"/g,''))
                // })

                const getImgsUrl = async () => {
                    return new Promise(async (resolve, reject) => {
                        for (let i = 0;i < imgSrc.length;i++) {
                            await handleUpload(imgSrc[i].replace(/<img src=/, '').replace(/\/>/, '').replace(/"/g, '')).then(src => {
                                formatText.splice((i * 2) + 1, 0, `<img src="${src}" />`)
                            })
                        }
                        resolve(false);
                    })
                }
                await getImgsUrl()
                toTextContent = formatText.join('')
            }

            // const text = editorState?.toText()
            const atList = getAtList(toTextContent)
            const { data: { code, json_params, desc } } = await sendTextMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 0,
                    // text_elem_content: editorState?.toText(),
                    text_elem_content: toTextContent,
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
    const getAtList = (text: string) => {
        const list = text.match(/@\w+/g);
        return list ? list.map(v => v.slice(1)) : []
    }
    const handleDropFile = (e) => {
        const file = e.dataTransfer?.files[0]
        const iterator = file.type.matchAll(/(\w+)\//g)
        const type = iterator.next().value[1]
        setDraging(false);
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
        // console.log(file, '发送文件')
        if (!file) return false;
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
        const size = 100
        if (!judgeFileSize(size, file)) {
            message.warning({
                content: `文件大小不能超过${size}M！`
            })
            return
        }
        if (!file) return false;
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
        console.log(file, 1111)
        if (code === 0) {
            dispatch(updateMessages({
                convId,
                message: JSON.parse(json_params)
            }))
            setPathToLS(file.path)
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
        convType === 2 && setAtPopup(true)
    }

    const handleSendFaceMessage = () => {
        // resetState()
        setEmojiPopup(true)
    }
    const handleSendPhoneMessage = () => {

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
            case "video":
                handleSendVideoMessage()
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
        // const type = sendType
        if (sendType == '0') {
            // enter发送
            if (e.ctrlKey && e.keyCode === 13) {
                // console.log('换行', '----------------------', editorState)
            } else if (e.keyCode == 13 || e.charCode === 13) {
                e.preventDefault();
                handleSendTextMsg();
            } else if (e.key === "@" && convType === 2) {
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
            } else if (e.key === "@" && convType === 2) {
                e.preventDefault();
                setAtPopup(true)
            }
        }

    }

    const onAtPopupCallback = (userName) => {
        resetState()
        if (userName) {
            setEditorState(ContentUtils.insertText(editorState, `@${userName} `))
        }
    }

    const handleSendCustEmojiMessage = async (url) => {
        try {

            const { data: { code, json_params, desc } } = await sendCustomMsg({
                convId,
                convType,
                messageElementArray: [{
                    elem_type: 3,
                    custom_elem_data: 'CUST_EMOJI',
                    custom_elem_desc: url,
                    custom_elem_ext: '自定义表情'
                }],
                userId
            });
            if (code === 0) {
                dispatch(reciMessage({
                    convId,
                    messages: [JSON.parse(json_params)]
                }))
            } else {
                message.error({ content: `消息发送失败 ${desc}` })
            }
        } catch (e) {
            message.error({ content: `出错了: ${e.message}` })
        }
    }

    const onEmojiPopupCallback = (id, type = '') => {
        resetState()
        if (type === CUSTEMOJI) {
            // 发送自定义表情
            handleSendCustEmojiMessage(id)
        } else {
            if (id) {
                setEditorState(ContentUtils.insertText(editorState, id))
            }
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

    const editorChange = (editorState, a, b) => {
        console.warn(editorState.toHTML())
        setIsTextNullEmpty(editorStateDisabled(editorState))
        setEditorState(editorState)
    }

    const menu = close => (
        <List type="option" style={{ width: '200px', background: '#ffffff' }}>
            <List.Item onClick={() => changeSendShotcut('1')} style={{ display: 'flex' }}>
                {
                    sendType == '1' ? <img className="chooseImg" src={chooseImg}></img> : <span style={{ padding: '0 10px' }}></span>
                }
                按Ctrl+Enter键发送消息
            </List.Item>
            <List.Item onClick={() => changeSendShotcut('0')} style={{ display: 'flex' }}>
                {
                    sendType == '0' ? <img className="chooseImg" src={chooseImg}></img> : <span style={{ padding: '0 10px' }}></span>
                }
                按Enter键发送消息
            </List.Item>
        </List>
    );
    const changeSendShotcut = index => {
        const tip = index == '1' ? '按Ctrl+Enter键发送消息' : '按Enter键发送消息'
        setShotKeyTip(tip)
        setSendType(index)
        ipcRenderer.send('CHANGESTORE', index)
        // console.log(localStorage.getItem('sendType'))
    }
    useEffect(() => {
        setEditorState(ContentUtils.clear(editorState))
    }, [convId, convType]);

    const shutUpStyle = isShutUpAll ? 'disabled-style' : '';
    const dragEnterStyle = isDraging ? 'draging-style' : '';
    const hooks = {
        // 'change-block-type': ({ href, target }) => {
        //     alert(111)
        //     href = href.indexOf('http') === 0 ? href : `http://${href}`
        //     console.log(href, '=====__________')
        //     return { href, target }
        // }
        'change-block-type': () => {
            alert(111)
        }
    }
    useEffect(() => {
        ipcRenderer.on('SENDSTORE', function (e, data) {
            console.log(data, '------------------------------------')
            setSendType(data)
        })
        setShotKeyTip(sendType == '1' ? ' 按Ctrl+Enter键发送消息' : '按Enter键发送消息')
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

    const editorStateDisabled = (text) => {
        return (!text?.toText().replace(/ /g, '').replace(/\n/g, '') && text?.toHTML().indexOf('<img src=') === -1)
    }

    return (
        <div className={`message-input ${shutUpStyle} ${dragEnterStyle}`} onDrop={handleDropFile} onDragLeaveCapture={handleDragLeave} onDragOver={handleDragEnter} >
            {
                atPopup && <AtPopup callback={(name) => onAtPopupCallback(name)} group_id={convId} />
            }
            <div className="message-input__feature-area">
                {
                    isEmojiPopup && <EmojiPopup callback={onEmojiPopupCallback} />
                }
                {

                    FEATURE_LIST[convType].map(({ id, content }) => (
                        <Bubble content={content} key={id}>
                            <span
                                className={`message-input__feature-area--icon ${id} ${activeFeature === id ? 'is-active' : ''}`}

                                onClick={() => handleFeatureClick(id)}
                            >
                            </span>
                        </Bubble>

                    ))
                }
            </div>
            <div className="message-input__text-area disabled" onDrop={handleDropFile} onDragOver={e => e.preventDefault()} onKeyDown={handleOnkeyPress}>
                <BraftEditor
                    //@ts-ignore
                    disabled={isShutUpAll}
                    onChange={editorChange}
                    value={editorState}
                    // controls={[]}
                    ref={instance => editorInstance = instance}
                    contentStyle={{ height: '100%', fontSize: 14 }}
                    placeholder={placeHolderText}
                    hooks={hooks}
                />
            </div>
            <span className="message-input__button-area">
                <Button type="primary" title={shotKeyTip} onClick={handleSendTextMsg} disabled={isTextNullEmpty}>发送</Button>
            </span>
            {/* <span className="message-input__down" title='切换发送消息快捷键'></span> */}
            <Dropdown
                clickClose={true}
                className="message-input__down"
                button=""
                appearance="button"
                onOpen={() => console.log('open')}
                onClose={() => console.log("close")}
                placement='left-end'
                placementOffset='100'
                boxSizeSync
            >
                {menu}
            </Dropdown>

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