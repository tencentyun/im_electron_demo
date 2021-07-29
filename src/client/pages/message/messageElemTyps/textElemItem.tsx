import React from "react";
import { decodeText } from "../../../utils/decodeText";
import { ImagePreview } from 'tea-component'
import { PicElemItem } from './picElemItem';

export const TextElemItem = (props: any): JSX.Element => {
    const isWebsit = (txtContent: string) => {
        let check_www = 'w{3}' + '[^\\s]*'
        let check_http = '(https|http|ftp|rtsp|mms)://' + '[^\\s]*'
        let strRegex = check_www + '|' + check_http
        let httpReg = new RegExp(strRegex, 'gi')
        let formatTxtContent = txtContent.replace(httpReg, function (httpText) {
            if (httpText.search('http') < 0 && httpText.search('HTTP') < 0) {
                return '<a href="' + 'http://' + httpText + '" target="_blank">' + httpText + '</a>'
            }
            else {
                return '<a href="' + httpText + '" target="_blank">' + httpText + '</a>'
            }
        })
        return formatTxtContent
    }
    const formatText = (content) => {
        // 格式化为只有img标签的字符串
        let texts = content?.text?.replace(/<img /g, 'xxxxx')
            .replace(/ >/g, 'YYYYY')
            // .replaceAll(/ /g, '&nbsp')
            // .replace(/<\/?.+?\/?>/g, '')
            // .replaceAll(/\n/g, '<br/>')
            .replace(/xxxxx/g, '<img ')
            .replace(/YYYYY/g, ' >')

        // 获取img标签内的url 并分隔文字与图片
        let imgs = texts.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/g)
        console.log(isWebsit(texts), '--------------------')
        // let textHtml = <span style={{whiteSpace: 'pre'}} dangerouslySetInnerHTML={{ __html: texts }}>{{texts}}</span>
        let textHtml = <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: isWebsit(texts) }}></span>

        // 把img图片用预览组件代替
        if (imgs && imgs.length > 0) {
            let urls = []
            let text = texts.split(/<img [^>]*>/);
            let arrayLength = new Array(Math.max(imgs ? imgs.length : 1, text ? text.length : 1)).fill('')
            urls = imgs.map((i) => {
                return i.replace(/<img src=/, '').replace(/\/>/, '').replace(/"/g, '').replace(/&nbsp/g, '')
            })
            // console.warn('看看你们是什么',imgs,text,texts)
            textHtml = <>
                {arrayLength.map((i, index) => {
                    // return <span key={index}>{text[index] ? <span dangerouslySetInnerHTML={{ __html: text[index] }}></span> : <></>}
                    return <span key={index}>{text[index] ? <span style={{ whiteSpace: 'pre-wrap' }}>{text[index]}</span> : <></>}
                        {urls[index] ? <PicElemItem
                            image_elem_orig_url={urls[index]}
                            previewSrc={urls[index]}
                            previewTitle="预览"
                        >
                            {open => <a onClick={open}><img src={urls[index]} style={{ maxWidth: 178 }}></img></a>}
                        </PicElemItem> : <></>}
                    </span>
                })}
            </>
        }
        return textHtml
    }

    const item = ({ text_elem_content }) => <span className="message-view__item--text text right-menu-item">{decodeText(text_elem_content).map((item, index) => {
        // 处理特殊字符 格式化空格和换行
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