import './emojiPopup.scss'
import React, { 
    FC, 
    useEffect, 
    useRef,
    useState
} from "react"
import {
    Menu,
    Item,
    contextMenu,
    theme,
    animation
} from 'react-contexify';
import { emojiMap, emojiName, emojiUrl } from '../emoji-map'
import { getCustEmoji, custEmojiUpsert }  from '../../../services/custEmoji'
import type { getCustEmojiType, custEmojiUpsertParams }  from '../../../services/custEmoji'
import { getLoginUserID } from '../api';
import { message } from 'tea-component';
import { throttle } from '../../../utils/tools'

interface EmojiPopupProps {
    callback: Function
}

const limit = 20
const EMOJIMENU = 'EMOJI_MENU'

export const CUSTEMOJI = 'CUST_EMOJI'
export const EmojiPopup: FC<EmojiPopupProps> = ({ callback }): JSX.Element => {
    const refPopup = useRef(null)
    const refCustEmoji = useRef(null)
    const [isShowCustEmoji, setIsShowCustEmoji] = useState(false)
    const [custEmojiList, setCustEmojiList] = useState([])
    const [page, setPage] = useState(1)
    const [isFinalPage, setIsFinalPage] = useState(false)
    
    useEffect(() => {
        document.addEventListener('click', handlePopupClick);
        return () => {
            document.removeEventListener('click', handlePopupClick);
        }
    }, []);

    const handlePopupClick = (e) => {
        if(!refPopup.current) return
        if (!refPopup.current.contains(e.target as Node) && refPopup.current !== e.target) {
            callback("")
        } 
    }

    const handleEmojiShow = () => {
        setIsShowCustEmoji(false)
    }

    const hanldeScrollCustEmoji = throttle(() => {
        if (refCustEmoji){
            const { scrollTop, clientHeight, scrollHeight } = refCustEmoji.current
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                !isFinalPage && onGetCustEmoji(page + 1)
            }
        }
    }, 300)

    const onGetCustEmoji = async (page) => {
        if (page !== 1 && isFinalPage) {
            return
        }
        setPage(page)
        try {
            const userId = await getLoginUserID()
            const params:getCustEmojiType = {
                uid: userId,
                page,
                limit
            }
            const data = await getCustEmoji(params)
            if (data.ErrorCode !== 0) {
                return
            }
            const dataList= data.Data || []
            if (page === 1) {
                setCustEmojiList(dataList)
            } else {
                setCustEmojiList([...custEmojiList, ...dataList])
            }
            setIsFinalPage(dataList.length < limit)
        } catch(e){
            console.log(e)
        }
    }
    const handleCustEmojiShow = async () => {
        setIsShowCustEmoji(true)
        onGetCustEmoji(1)
    }

    const handleContextMenuEvent = (e, id: number) => {
        e.preventDefault();
        contextMenu.show({
            id: EMOJIMENU,
            event: e,
            props: { id }
        })
    }

    const handlDeleteClick =async (e) => {
        try {
            const userId = await getLoginUserID()
            const params: custEmojiUpsertParams = {
                id: e.props.id,
                op_type: 2,
                uid: userId
            }
            const {ErrorCode, ErrorInfo } = await custEmojiUpsert(params)
            if (ErrorCode === 0) {
                message.success({ content: '删除成功' })
                onGetCustEmoji(1)
            } else {
                message.error({ content: ErrorInfo })
            }
        } catch(e) {
            message.error({ content: '删除错误' })
        }
    }
    return (
            <div ref={refPopup} className="emoji-popup">
                { 
                    !isShowCustEmoji && <div className="emojis emojis-default">
                        {
                            emojiName.map((v, i) => <span key={i} onClick={() => callback(v)}>
                                < img src={emojiUrl + emojiMap[v]} />
                            </span>)
                        }
                    </div>
                }
                {
                    isShowCustEmoji && <div ref={refCustEmoji} onScrollCapture={hanldeScrollCustEmoji} className="emojis emojis-cust">
                        {
                            custEmojiList.map((v, i) => <span key={i} onClick={() => callback(v.sticker_url, CUSTEMOJI)}  onContextMenu={(e) => { handleContextMenuEvent(e, v.id) }}>
                                < img src={v.sticker_url} title="发送" />
                            </span>)
                        }
                    </div>
                }
                {
                    isShowCustEmoji && <Menu
                        id={EMOJIMENU}
                        theme={theme.light}
                        animation={animation.fade}
                     >
                        <Item onClick={(e) => handlDeleteClick(e)}>删除 </Item>
                    </Menu>
                }
                <div className="emoji-tab">
                    <div className="tabs">
                        <div className={ !isShowCustEmoji ? 'single smileiconactive' : 'single smileicon' } onClick={ handleEmojiShow }>
                            <div className="tab-icon"></div>
                        </div>
                        <div className={ isShowCustEmoji ? 'single custemojiactive' : 'single custemojiicon' } onClick={ handleCustEmojiShow }>
                            <div className="tab-icon"></div>
                        </div>
                    </div>
                </div>
            </div>
    )
}