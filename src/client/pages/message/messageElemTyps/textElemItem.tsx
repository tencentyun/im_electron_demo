import React from "react";
import { isEqual } from "lodash";
import { decodeText } from "../../../utils/decodeText";
import withMemo from "../../../utils/componentWithMemo";

const TextElemItem = (props: any): JSX.Element => {
    const formatText = (content) => {
        //发啥就是哈
        let textHtml = <span style={{ whiteSpace: 'pre-wrap' }} >{content?.text}</span>
        // 格式化为只有img标签的字符串
        // let texts = content?.text?.replace(/<img /g, 'xxxxx')
        //     .replace(/ >/g, 'YYYYY')
        //     // .replaceAll(/ /g, '&nbsp')
        //     // .replace(/<\/?.+?\/?>/g, '')
        //     // .replaceAll(/\n/g, '<br/>')
        //     .replace(/xxxxx/g, '<img ')
        //     .replace(/YYYYY/g, ' >')

        // // 获取img标签内的url 并分隔文字与图片
        // let imgs = texts.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/g)
        // console.log(isWebsit(texts), '--------------------')
        // // let textHtml = <span style={{whiteSpace: 'pre'}} dangerouslySetInnerHTML={{ __html: texts }}>{{texts}}</span>
        // let textHtml = <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: isWebsit(texts) }}></span>
        // // 把img图片用预览组件代替
        // if (imgs && imgs.length > 0) {
        //     let urls = []
        //     let text = texts.split(/<img [^>]*>/);
        //     let arrayLength = new Array(Math.max(imgs ? imgs.length : 1, text ? text.length : 1)).fill('')
        //     urls = imgs.map((i) => {
        //         return i.replace(/<img src=/, '').replace(/\/>/, '').replace(/"/g, '').replace(/&nbsp/g, '')
        //     })
        //     // console.warn('看看你们是什么',imgs,text,texts)


        //     textHtml = <>
        //         {arrayLength.map((i, index) => {
        //             // return <span key={index}>{text[index] ? <span dangerouslySetInnerHTML={{ __html: text[index] }}></span> : <></>}
        //             return <span key={index}>{text[index] ? <span style={{ whiteSpace: 'pre-wrap' }}>{text[index]}</span> : <></>}
        //                 {urls[index] ? <PicElemItem
        //                     onClick={handleOpen(urls)}
        //                     image_elem_orig_url={urls[index]}
        //                 >
        //                 </PicElemItem> : <></>}
        //             </span>
        //         })}
        //     </>
        // }
        return textHtml
    }

    const handleOpen = (url) => {
        // dispatch(setImgViewerAction({
        //     isShow: true,
        //     imgs: url,
        //     isCanOpenFileDir: false,
        //     index:0
        // }))
    }
    const item = ({ text_elem_content }) => <span className="message-view__item--text text right-menu-item">{decodeText(text_elem_content).map((item, index) => {
        return <span key={index}>{
            item.name === 'text' ? <span>{formatText(item)}</span> : <img src={item.src} style={{
                width: 30,
                height: 30
            }} />
        }</span>
    })}</span>;
    return (
        item(props)
    );
}

export default withMemo(TextElemItem)