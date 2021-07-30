/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Button, Upload, message } from 'tea-component';
import Cropper, { ReactCropperProps } from 'react-cropper';
import axios from 'axios'
import './index.scss'
import "cropperjs/dist/cropper.css"
import { dataURLtoBlob, convertBase64UrlToBlob } from '../../utils/tools'
import { SDKAPPID } from '../../constants/index'
import { TIM_BASE_URL } from '../../constants/index'

const imgStyle = { width: '60px', height: '60px', cursor: 'pointer' }

interface IRes {
  download_url?: string;
  upload_url?: string;
  data: any;
}

// 组件默认属性
const defaultImgCropperProp: ImgCropperProp = {
  isShowCropper: true,
  cropperOption: {
    aspectRatio: 1,
    guides: false,
    style: {
      width: "100%",
      height: "200px",
    },
  },
};

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

const ImgCropper = (prop: ImgCropperProp): JSX.Element => {
  prop = Object.assign({}, defaultImgCropperProp, prop)
  const { value, onChange, cropperOption, isShowCropper } = prop
  const [uploading, setUploading] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [cropperUrl, setropperUrl] = useState(null);
  const [cropper, setCropper] = useState<Cropper>(null);
  const [selectFile, setSelectFile] = useState(null);
  const [_val, setVal] = useState(value)
  let instance = null, fileObj = null

  const userSig =localStorage.getItem('usersig')
  const uid =localStorage.getItem('uid')

  const onSetImgUrl = async (file) => {
    if (prop.isShowCropper) {
      const url = await dataURLtoBlob(file)
      if (file.type === 'image/gif') {
        setImgUrl('')
      } else {
        setImgUrl(url)
      }
    }
  }

  // useEffect(() => {
  //   if(prop.value){
  //     onChange?.(prop.value)
  //   }else{
  //     onChange?.(_val)
  //   }
  //   console.log('_val', _val)
  // }, [_val])

  useEffect(() => {
    setCropper(instance);
  }, [instance]);


  // 确定裁剪
  function confirmCopper() {
    if (imgUrl) {
      let base64Data = cropper.getCroppedCanvas().toDataURL();
      prop.afterCropper?.(base64Data);
      const fileType = selectFile ? "." + selectFile.type.split("/")[1] : "png";
      const newFileName =
        new Date().getTime().toString() +
        Math.floor(Math.random() * 1000000).toString() +
        fileType;
      fileObj = new File([base64Data], newFileName, {
        type: selectFile.type,
      });
      prop.cropperFile?.(fileObj);
      handleUpload(base64Data).then((res: IRes) => {
        const { download_url } = res;
        prop.afterUpload?.(download_url);
        setVal(download_url);
        if (!prop.isShowCropper) {
          setropperUrl(download_url);
          return;
        }
      });
    }
  }

  function handleOnStart() {
    if (!fileObj) return
    if (fileObj.type === 'image/gif') {
      var reader = new FileReader()
      reader.readAsDataURL(fileObj)
      reader.onload = () => {
        let base64 = reader.result;
        console.log("base64");
        handleUpload(base64).then((res: IRes) => {
          const { download_url } = res
          setImgUrl('')
          setVal(download_url)
          setropperUrl(download_url)
          prop.afterUpload?.(download_url)
        })
      }
      return
    }
  }

  // 上传逻辑
  const handleUpload = (base64Data) => {
    return new Promise((resolve, reject) => {
      setUploading(true)
      axios.post(`${TIM_BASE_URL}/huarun/im_cos_msg/pre_sig`, {
        sdkappid: SDKAPPID,
        uid: uid,
        userSig: userSig,
        file_type: 1,
        file_name: "headUrl/" + new Date().getTime() + fileObj.name,
        Duration: 900,
        upload_method: 0,
      }).then(res => {
        if (res.data.error_code === 0) {
          console.log(res)
          const { download_url } = res.data
          let fr = new FileReader();
          fr.readAsDataURL(fileObj);
          fr.addEventListener(
            "load",
            () => {
              axios.put(download_url, convertBase64UrlToBlob(base64Data)).then((response) => {
                const { download_url } = res.data
                setVal(download_url)
                setImgUrl('')
                resolve(res.data)
                message.success({
                  content: "上传成功",
                })
              }).catch(err => {
                reject(err)
              }).finally(() => {
                setUploading(false)
              })
            },
            false
          )
        }

      }).catch(err => {
        if (err !== '') {
          message.error(err)
        } else {
          message.error({
            content: "服务端错误",
          })
        }

        reject(err)
        setUploading(false)
      })
    })
  }

  //用户选择文件 
  function handleBeforeUpload(file, fileList, isAccepted) {
    // const is2m = (file as File).size / 1024 / 1024 > 2
    // if (is2m) {
    //   message.warning({ content: '图片不能大于2m' })
    //   return false
    // }
    fileObj = file
    setSelectFile(fileObj)
    onSetImgUrl(fileObj)
    prop.beforeUpload?.(fileObj)
    return true
  }
  const successChange = () => {
    if (prop.value) {
      onChange?.(prop.value);
    } else {
      onChange?.(_val);
    }
  };
  return (
    <>
      <Upload
        action={prop.value}
        onStart={handleOnStart}
        method={"put"}
        onSuccess={successChange}
        beforeUpload={handleBeforeUpload}
      >
        {cropperUrl ? (
          <img
            src={cropperUrl}
            alt=""
            style={imgStyle}
          />
        ) : _val ? (
          ""
        ) : (
          <Button htmlType="button" className="upload-btn" loading={uploading}>
            点击上传
          </Button>
        )}
        {!cropperUrl && !imgUrl && _val ? (
          <img
            src={_val}
            alt="无法加载"
            style={imgStyle}
          />
        ) : (
          <div>暂无头像</div>
        )}
      </Upload>
      {
        isShowCropper && imgUrl && <div>
          <Cropper
          viewMode={1}
            {...cropperOption}
            src={imgUrl}
            onInitialized={(instance) => {
              setCropper(instance);
            }}
          />
          <Button
            className="confirmCopper-btn"
            loading={uploading}
            htmlType="button"
            onClick={confirmCopper}>
            确定
          </Button>
        </div>
      }
    </>
  );
};

export default ImgCropper;
