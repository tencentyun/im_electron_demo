/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from 'react-dom';
import { Button, Upload, message } from 'tea-component';
import Cropper, { ReactCropperProps } from 'react-cropper';
import "cropperjs/dist/cropper.css"
import axios from 'axios'
import './index.scss'


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
    style: {
      width: '100%',
      height: '200px',
    }
  },
}

interface ImgCropperProp {
  afterCropper?: (imgUrl?: string) => void;
  afterUpload?: (imgUrl?: string) => void;
  cropperFile?: (file?: File) => void;
  beforeUpload?: (file?: File) => void;
  isShowCropper?: boolean;
  cropperOption?: ReactCropperProps;
  value?: string;
  onChange?: (imgUrl?: string) => void;
}

function getBlob(file) {
     const [blob, setBlob] = useState(null);
  if (window.FileReader) {
    var fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onloadend = function (e) {
      setBlob(e.target.result)
    }
  }

  return blob
}


const ImgCropper = (prop: ImgCropperProp): JSX.Element => {
  prop = Object.assign({}, defaultImgCropperProp, prop)
  console.log('prop',prop)
  const { value, onChange } = prop
  const [uploading, setUploading] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [cropperUrl, setropperUrl] = useState(null);
  const [cropper, setCropper] = useState<Cropper>(null);
  const [selectFile, setSelectFile] = useState(null);
  const [_val, setVal] = useState(value)
  let instance = null ,fileObj = null

  useEffect(() => {
    if (prop.isShowCropper) {
      console.log('fileObj', fileObj, 'selectFile', selectFile);
      console.log('window.FileReader && fileObj', window.FileReader && fileObj);
      console.log('window.FileReader', window.FileReader);
      //     if (window.FileReader && selectFile) {
       
      //   var fr = new FileReader();
      //   fr.readAsDataURL(selectFile);
      //       fr.onloadend = (e) => {
      //         console.log('e');
      //      if (selectFile.type === 'image/gif') {
      //         setImgUrl('')
      //       } else {

      //         setImgUrl(e.target.result)
      //       }
      //   }
      // }
    }
      // console.log('getBlob(selectFile)',getBlob(selectFile));

  }, [selectFile])

  useEffect(() => {
    onChange?.(_val)
    console.log('_val', _val)
  }, [_val])

  useEffect(() => {
    setCropper(instance)
  }, [instance])



  // 确定裁剪
  function confirmCopper() {
    if (imgUrl) {
      let base64Data = cropper.getCroppedCanvas().toDataURL()
      prop.afterCropper?.(base64Data)
      const fileType = selectFile ? '.' + selectFile.type.split('/')[1] : 'png'
      const newFileName = new Date().getTime().toString() + Math.floor(Math.random() * 1000000).toString() + fileType
      fileObj = new File([base64Data], newFileName, {
        type: selectFile.type,
      })
      prop.cropperFile?.(fileObj)
      handleUpload(base64Data).then((res: IRes) => {
        const { download_url } = res
        prop.afterUpload?.(download_url)
        setVal(download_url)
        if (!prop.isShowCropper) {
          setropperUrl(download_url)
          return
        }
  
      })
    }
  }

  function handleImg() {
  console.log('   fileObj = file',    fileObj)
    if(!fileObj) return
    if (fileObj.type === 'image/gif') {
      var reader = new FileReader()
      reader.readAsDataURL(fileObj)
      reader.onload = () => {
        let base64 = reader.result
        console.log('base64')
        handleUpload(base64).then((res: IRes) => {
          const { download_url } = res
          setImgUrl('')
          setVal(download_url)
          setropperUrl(download_url)
        })
      }
      return
    } 
  
  }


  const convertBase64UrlToBlob = (urlData) => {
    let bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
    let ab = new ArrayBuffer(bytes.length)
    let ia = new Uint8Array(ab)
    for (let i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i)
    }
    return new Blob([ab], { type: 'image/jpeg' })
  }
  // 上传逻辑
  const handleUpload = (base64Data) => {
    return new Promise((resolve, reject) => {
      setUploading(true)
      axios.post('/api/im_cos_msg/pre_sig', {
        sdkappid: 1400187352,
        uid: "tetetetetetet",
        file_type: 1,
        file_name: 'headUrl/'+fileObj.name,
        Duration: 900,
        'upload_method': 0,
      }).then(res => {
        console.log(res)
        const { upload_url } = res.data
        let fr = new FileReader();
        fr.readAsDataURL(fileObj);
        fr.addEventListener(
          "load",
          () => {
            axios.put(upload_url, convertBase64UrlToBlob(base64Data), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then(() => {
              const { download_url } = res.data
              setVal(download_url)
              setImgUrl('')
              resolve(res.data)
              message.success({
                content: "上传成功",
              }) 
            }).catch(err => {
              reject(err)
            }).finally(()=>{
              setUploading(false)
            })
          },
          false
        );

      }).catch(err => {
        reject(err)
        setUploading(false)
      })
    })

  }


  //用户选择文件 
  function handleBeforeUpload(file, fileList, isAccepted) {
    console.log('handleBeforeUpload')
 
    console.log('handleBeforeUpload',file)
   
    const is2m = (file as File).size/1024 /1024> 2
    if(is2m){
      message.warning({content:'图片不能大于2m'})
      return false
    }
    fileObj = file
    setSelectFile(fileObj)
    prop.beforeUpload?.(fileObj)
    return true
  }

  function handleOnStart() {
    console.log('handleOnStart')
    handleImg()
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
          cropperUrl ? <img src={cropperUrl} alt="" style={{ width: '100px', height: '100px', }} /> :  _val? '':<Button htmlType="button" className="upload-btn" loading={uploading}>点击上传</Button>
        }
        {
          !cropperUrl && !imgUrl && _val ? (<img src={_val} alt="无法加载" style={{ width: '100px', height: '100px', }} />) : <div>暂无头像</div>
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
            imgUrl && <div> <Button className="confirmCopper-btn" loading={uploading} htmlType="button" onClick={confirmCopper}>确定</Button> </div>
          }

        </div>
      }

    </>
  );
};

export default ImgCropper