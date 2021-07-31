
import React, { useState, useEffect } from "react"
import './index.scss'
import { showDialog } from "../../utils/tools";

interface ImagePreviewI {
    show: boolean;
    url: string | string[];
    onClose: (bool?: boolean) => void;
    index?: number;
    isCanOpenFileDir?: boolean
}

const defaultProp = {
    isCanOpenFileDir: true,
}
const showPic = () => {
    showDialog()
}
const defaultConfig = {
    rotate: 0,
    minzoom: 0.1,
    zoom: 1,
    index: 0
}
const inintViewer = (prop: ImagePreviewI) => {
    // console.log('prop', prop);
    const { show, url, onClose, index, isCanOpenFileDir } = Object.assign({}, defaultProp, prop)
    const [zoom, setZoom] = useState(defaultConfig.zoom)
    const [minZoom, setminZoom] = useState(defaultConfig.minzoom)
    const [rotate, setRotate] = useState(defaultConfig.rotate)
    const [previewUrl, setpreviewUrl] = useState('')
    const [_index, setindex] = useState(defaultConfig.index)
    const [imgUrlList, setimgUrlList] = useState([])
    const [visible, setvisible] = useState(false)
    const handleMouseWheel = (event) => {
        if (event.nativeEvent?.wheelDelta > 0) {
            zoomIn()
        } else {
            zoomOut()
        }
    }

    const handleFileClick = () => {
        showPic()
    }
    const resetSeting = () => {
        setRotate(defaultConfig.rotate)
        setZoom(defaultConfig.zoom)
    }
    useEffect(() => {
        setvisible(show)
        resetSeting()
    }, [show])

    useEffect(() => {
        if (Array.isArray(url)) {
            setpreviewUrl(url[getCurrentIndex()])
            setimgUrlList(url)
        } else {
            setimgUrlList([url])
            setpreviewUrl(url)
        }
    }, [url])

    useEffect(() => {
        resetSeting()
        if (Array.isArray(url)) {
            setpreviewUrl(url[_index])
        } else {
            setpreviewUrl(url)
        }
    }, [_index])

    useEffect(() => {
        if (index > -1) {
            setindex(index)
        }
    }, [index])

    const getCurrentIndex = (): number => {
        return index > -1 ? index : _index
    }

    const zoomIn = () => {
        const val = zoom + 0.1
        setZoom(val)
    }
    const zoomOut = () => {
        const val = zoom - 0.1 > minZoom ? zoom - 0.1 : minZoom
        setZoom(val)
    }
    const close = () => {
        setZoom(1)
        setvisible(false)
        onClose(false)
    }

    const rotateLeft = () => {
        const val = rotate - 90
        setRotate(val)
    }
    const rotateRight = () => {
        const val = rotate + 90
        setRotate(val)
    }
    const goNext = () => {
        if (imgUrlList.length <= 1) return
        const val = (_index + 1) % imgUrlList.length
        setindex(val)
    }
    const goPrev = () => {
        if (imgUrlList.length <= 1) return
        const val = _index - 1 >= 0 ? _index - 1 : imgUrlList.length - 1
        setindex(val)
    }

    return (
        <>
            {
                visible ?
                    (<div className="image-previewer-wrapper" onWheel={handleMouseWheel} >
                        <div className="image-wrapper">
                            <img
                                className="image-preview"
                                style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
                                src={(previewUrl.substring(0,previewUrl.indexOf('?imageView')).replace('30004/oaim','30003'))}
                                onClick={close}
                            />
                        </div>
                        <div className="close-button">
                            <i className="btn-icon btn-close" onClick={close}></i>
                        </div>

                        <div className="prev-button" onClick={goPrev}>
                            <i className="btn-icon btn-pre"></i>
                        </div>
                        <div className="next-button" onClick={goNext}>
                            <i className="btn-icon btn-next"></i>
                        </div>

                        <div className="actions-bar">
                            <i className="btn-icon btn-mini" onClick={zoomOut}></i>
                            <i className="btn-icon btn-plus" onClick={zoomIn}></i>
                            <i className="btn-icon btn-out" onClick={rotateLeft}></i>
                            <i className="btn-icon btn-in" onClick={rotateRight}></i>
                            {
                                isCanOpenFileDir ? <i className="btn-icon btn-file" onClick={handleFileClick}></i> : null
                            }

                            <span className="image-counter">{_index + 1} / {imgUrlList.length}</span>
                        </div>
                    </div>
                    ) : null
            }
        </>

    )
}

const ImagePreview = (prop: ImagePreviewI) => {
    return inintViewer(prop)
}

export default ImagePreview



