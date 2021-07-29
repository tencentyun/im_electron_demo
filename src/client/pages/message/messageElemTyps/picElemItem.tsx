import { shell } from "electron";
import React, { useEffect } from "react";
import { downloadFilesByUrl, showDialog } from "../../../utils/tools";
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'

const ImagePreview = (prop) => {
    const {children,url} = prop
  const [visible, setVisible] = React.useState(false);
    const [imgUrl, setImgUrl] = React.useState([{src:url}])
    const showPic = () => {
           console.log('111');
        showDialog()
    }
    const dom  =  children ? children((imgUrlArr: any[]) => {
              setImgUrl(imgUrlArr)
              setVisible(true)
    }) : null
    useEffect(() => {
       
        
        if (imgUrl[0] && imgUrl[0].src) {
        
            const viewer = new Viewer(document.getElementById(imgUrl[0] && imgUrl[0].src), {
                url: 'data-original',
                toolbar: {
                    zoomIn: 4,
                    zoomOut: 4,
                    oneToOne: 4,
                    reset: 4,
                    prev: 4,
                    play: false,
                    next: 4,
                    rotateLeft: 4,
                    rotateRight: 4,
                    flipHorizontal: 4,
                    flipVertical: 4,
                },
                viewed() {
                    const dirBtn = document.querySelector('.viewer-toolbar .viewer-flip-dir')
                         console.log('dirBtn1',dirBtn);
                    if(dirBtn) return
                   const viewerToolbar = document.querySelector('.viewer-toolbar')
                    const li = document.createElement('li')
                    const icon = document.createElement('i')
                    icon.setAttribute('class','preview-btn')
                    li.appendChild(icon)
                    li.setAttribute('tabindex','0')
                    li.setAttribute('role', 'button')
                    li.setAttribute('class', 'viewer-flip-dir viewer-hide-md-down')
                    viewerToolbar.addEventListener('click', (e) => {
                        const classList = Array.from((e.target as HTMLElement).classList)
                        if (classList.includes('viewer-flip-dir') || classList.includes('preview-btn')) {
                            showPic()
                        }
                    },false)
                    viewerToolbar.querySelector('ul').appendChild(li)
                },
            }); 
        }
        return () => {
             const viewerToolbarUl = document.querySelector('.viewer-toolbar ul')
            const dirBtn = document.querySelector('.viewer-toolbar .viewer-flip-dir')
            console.log('dirBtn',dirBtn);
            if (dirBtn) {
            viewerToolbarUl.removeChild(dirBtn)
                
            }
        }
    }, [visible])
  return (
      <div>
          {
              dom
      }
    </div>
  );
}


export const PicElemItem = (props: any): JSX.Element => {

    const showPic = () => {
        try {
            const imageName = props.image_elem_large_id.match(/([\d|a-z]+\.\w+)$/)[1]
            const path = process.cwd() + '/download/' + imageName
            console.log(path)
            shell.showItemInFolder(path)
        } catch(e) {}
    }
    
  
    const item = ({ image_elem_thumb_url, image_elem_orig_url, image_elem_large_url }) => {

        const url = image_elem_thumb_url || image_elem_orig_url || image_elem_large_url
        return (
            <div className="message-view__item--text text right-menu-item">
                <ImagePreview>
                    {open=>  <img id={url} data-original={url} src={url} onClick={open.bind(this,[{src:url}])} style={{ maxWidth: 178 }}></img>}
                </ImagePreview>
            </div>
        )
    };
    const downloadPic = (file_url, file_name) => {
        const params = {file_url,file_name}
        downloadFilesByUrl(params)
    }
    const savePic = () => {
        // 大图、原图、缩略图
        const { image_elem_orig_url, image_elem_thumb_id } = props;
        // console.log(image_elem_orig_url, '__________________________________', props)
        image_elem_orig_url && downloadPic(image_elem_orig_url, image_elem_thumb_id)
    }
    useEffect(() => {
        savePic()
    }, [])
    return item(props);
}