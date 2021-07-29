import { shell } from "electron";
import React, { useEffect } from "react";
import { downloadFilesByUrl, showDialog } from "../../../utils/tools";
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'

const ImagePreview = (prop) => {
    const {children} = prop
  const [visible, setVisible] = React.useState(false);
  const [imgUrl, setImgUrl] = React.useState([])
    useEffect(() => {
        if (imgUrl[0]) {
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
                }
            }); 
        }
    },[visible])
  return (
      <div>
          {
          children && children((imgUrlArr:string[]) => {
              setImgUrl(imgUrlArr)
              setVisible(true)
          })
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
                    {open=>  <img id={url} data-original={url} src={url} onClick={open.bind(this,[{src:url}])} style={{ maxWidth: 450 }}></img>}
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