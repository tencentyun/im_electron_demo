/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from 'react-dom';
import { Button, Upload, message } from 'tea-component';
import Cropper, { ReactCropperProps } from 'react-cropper';
import "cropperjs/dist/cropper.css"
import axios from 'axios'
import './index.scss'


interface Ires {
  upload_url: string,
  download_url: string
}


//file对象转换为Blob对象 

function dataURLtoBlob(file, cb) {
  if (!file) return
  if (window.FileReader) {
    var fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onloadend = function (e) {
      cb && cb(e.target.result)
    }
  }
}

interface IRes {
  download_url: string;
  data: any
}

// 组件默认属性
const defaultImgCropperProp: ImgCropperProp = {
  isShowCropper: true,
  cropperOption: {
    aspectRatio: 1,
    guides: false,
    style:{
      width: '100%',
      height: '200px',
    }
  }
}

interface ImgCropperProp {
  afterCropper?: (imgUrl?: string) => void;
  afterUpload?: (imgUrl?: string) => void;
  cropperFile?: (file?: File) => void;
  beforeUpload?: (file?: File) => void;
  isShowCropper?: boolean;
  cropperOption?: ReactCropperProps
}


const ImgCropper = (prop: ImgCropperProp): JSX.Element => {

  prop = Object.assign({}, defaultImgCropperProp, prop)
  const [uploading, setUploading] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [cropperUrl, setropperUrl] = useState(null);
  const [cropper, setCropper] = useState<Cropper>(null);
  const [selectFile, setSelectFile] = useState(null);

  let instance = null, fileObj = null

  useEffect(() => {
    if (prop.isShowCropper) {
      dataURLtoBlob(selectFile, url => {
        if (selectFile.type === 'image/gif') {
          setImgUrl('')
        } else {
          setImgUrl(url)
        }
      })
    }
  }, [selectFile])



  useEffect(() => {
    setCropper(instance)
  }, [instance])


  // 确定裁剪
  function confirmCopper() {
    if (imgUrl) {
      let base64Data = cropper.getCroppedCanvas().toDataURL()
      prop?.afterUpload(base64Data)
      const fileType = selectFile ? '.' + selectFile.type.split('/')[1] : 'png'
      const newFileName = new Date().getTime().toString() + Math.floor(Math.random() * 1000000).toString() + fileType
      fileObj = new File([base64Data], newFileName, {
        type: selectFile.type,
      })
      prop?.cropperFile(fileObj)
      getUrl()
      setImgUrl('')
    }
  }

  function getUrl() {
    handleUpload().then((res: IRes) => {
      const { download_url } = res
      prop?.afterUpload(download_url)
      if(!prop.isShowCropper){
        setropperUrl(download_url)
        return
      }
      axios.get(download_url).then(res => {  
          setropperUrl(res.data)
      })
    })
  }
  // 上传逻辑
  const handleUpload = () => {
    return new Promise((resolve, reject) => {
      setUploading(true)
      axios.post('/api/im_cos_msg/pre_sig', {
        sdkappid: 1400187352,
        uid: "tetetetetetet",
        file_type: 1,
        file_name: fileObj.name,
        Duration: 900,
        'upload_method': 0,
      }).then(res => {
        const { upload_url } = res.data
        let fr = new FileReader();
        fr.readAsDataURL(fileObj);
        fr.addEventListener(
          "load",
          () => {
            let arr = (fr?.result as string).split(',');
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            axios.put(upload_url, u8arr, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then(() => {
              resolve(res.data)
              message.success({
                content: "上传成功",
              })
              setUploading(false)
            }).catch(err => {
              reject(err)
            })

          },
          false
        );

      }).catch(err => {
        reject(err)
      })
    })

  }


  //用户选择文件 
  function handleBeforeUpload(file, fileList, isAccepted) {
    fileObj = file
    prop?.beforeUpload(fileObj)
    if (file.type === 'image/gif') {
      handleUpload().then((res: IRes) => {
        const { download_url } = res
        setImgUrl('')
        setropperUrl(download_url)
      })
    } else {
      setSelectFile(file)
    }
   
    return !prop.isShowCropper   
  }

  function handleOnStart(file) {
    getUrl()
  }
  const { cropperOption, isShowCropper } = prop
  return (
    <>
      <Upload
        action="###"
        onStart={handleOnStart}
        beforeUpload={handleBeforeUpload}
      >
        {
          cropperUrl ? <img src={cropperUrl} alt="" style={{ width: '100px', height: '100px', }} /> : <Button className="upload-btn" loading={uploading} onClick={e=>e.preventDefault()}>点击上传</Button>
        }
      </Upload>
      {
        isShowCropper && <div>
          {

            imgUrl ?

              (<Cropper
                {...cropperOption}
                src={imgUrl}
                onInitialized={(instance) => {
                  setCropper(instance);
                }}
              />) : ''}
          {
            imgUrl && <div> <Button className="confirmCopper-btn" onClick={confirmCopper}>确定</Button> </div>
          }

        </div>
      }

    </>
  );
};

export default ImgCropper