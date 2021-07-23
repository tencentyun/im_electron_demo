import React, { FC, useEffect, useState } from "react"
import timRenderInstance from '../../utils/timRenderInstance';

import './index.scss'
import {
  Form,
  Input,
  RadioGroup,
  Radio,
  Button,
  Modal,
  Upload,
  message
} from "tea-component";
import { Form as FinalForm, Field } from "react-final-form";
import ImgCropper from "../../components/UploadFace";

const genderMap = {
  '1': '男',
  '2': '女',
  '0': '不显示'
}

/**
 * @brief 用户性别类型
 */
enum TIMGenderType {
  kTIMGenderType_Unkown = 0,
  kTIMGenderType_Male = 1,
  kTIMGenderType_Female = 2
}

interface UserInfo {
  userInfo: IUser;
  visible: boolean;
  onChange?: (val?: boolean) => void;
  onClose: (val?: boolean) => void;
  onUpdateUserInfo?: () => void;
}

interface IUser {
  faceUrl?: string;
  nickName?: string;
  gender?: TIMGenderType;
  userId?: string;
  [propName: string]: any;
}

/**
 * 数据提交
 */
interface submitUserInfoData {
  user_data: string;
  json_modify_self_user_profile_param: UserProfileItem
}

interface UserProfileCustemStringInfo {
  user_profile_custom_string_info_key: string;
  user_profile_custom_string_info_value: string;
}

/**
 * @brief 用户加好友的选项
 */
enum TIMProfileAddPermission {
  kTIMProfileAddPermission_Unknown = 0,
  kTIMProfileAddPermission_AllowAny = 1,
  kTIMProfileAddPermission_NeedConfirm = 2,
  kTIMProfileAddPermission_DenyAny = 3
}
interface UserProfileItem {
  user_profile_item_nick_name?: string;
  user_profile_item_gender?: TIMGenderType;
  user_profile_item_face_url?: string;
  user_profile_item_self_signature?: string;
  user_profile_item_add_permission?: TIMProfileAddPermission;
  user_profile_item_location?: number;
  user_profile_item_language?: number;
  user_profile_item_birthday?: number;
  user_profile_item_level?: number;
  user_profile_item_role?: number;
  user_profile_item_custom_string_array?: Array<UserProfileCustemStringInfo>;
}


export const UserInfo: FC<UserInfo> = ({ visible, onChange, onClose, userInfo,onUpdateUserInfo }): JSX.Element => {
  const [isShow, setVisible] = useState(visible)

  const close = () => {
    setVisible(false)
    onClose(false)
  }

  function afterUpload(imgUrl) {
    console.log('imgUrl',imgUrl)
 }

  useEffect(() => {
    setVisible(visible)
    onChange && onChange(visible)
  }, [visible])

  function getStatus(meta, validating?) {
    if (meta.active && validating) {
      return "validating";
    }
    if (!meta.touched) {
      return null;
    }
    return meta.error ? "error" : "success";
  }
console.log('userinfo',userInfo);
  async function onSubmit(values: IUser) {
    const formData: submitUserInfoData = {
      json_modify_self_user_profile_param: {
        user_profile_item_face_url: values.faceUrl,
        user_profile_item_nick_name: values.nickName,
        user_profile_item_gender: +values.gender
      },
      user_data: ''
    }
    console.log('formData', formData)
     const {data: {code}} = await timRenderInstance.TIMProfileModifySelfUserProfile(formData)
      if (code === 0) {
        message.success({
              content:'修改成功'
        })
      onUpdateUserInfo && onUpdateUserInfo()
      } else {
         message.error({
              content:'修改失败'
            })
      }
      close()
  }
const {nickName,faceUrl,gender} = userInfo
  return (
    <Modal visible={isShow} caption="编辑个人资料" onClose={close}>
      <Modal.Body>
        <FinalForm
          onSubmit={onSubmit}
          initialValuesEqual={() => true}
          initialValues={{
            faceUrl: faceUrl,
            nickName: nickName,
            gender: gender?.toString(),
          }}
        >
          {({ handleSubmit, validating, submitting }) => {
            return (
              <form onSubmit={handleSubmit}>
                <Form>
                  <Field
                    name="faceUrl"
                    validateFields={[]}
                  >
                    {({ input, meta }) => (
                      
                      <Form.Item
                        label="头像"
                      >
                        <ImgCropper {...input} afterUpload={afterUpload}></ImgCropper>
                      </Form.Item>
                    )}
                  </Field>
                  <Field
                    name="nickName"
                    validateOnBlur
                    validateFields={[]}
                    validate={async value => {
                      return !value || value.length <= 0
                        ? "姓名太短了哦"
                        : undefined;
                    }}
                  >
                    {({ input, meta }) => (
                      <Form.Item
                        label="姓名"
                        status={getStatus(meta, validating)}
                        message={
                          getStatus(meta, validating) === "error" &&
                          meta.error
                        }
                      >
                        <Input
                          {...input}
                          autoComplete="off"
                          placeholder="你是谁"
                        />
                      </Form.Item>
                    )}
                  </Field>
                  <Field
                    name="gender"
                    validateFields={[]}
                    validate={value =>
                       value ? value.length < 1 ? "请至少选择一个哦" : undefined : undefined
                    }
                  >
                    {({ input, meta }) => (
                      <Form.Item
                        label="性别"
                        status={getStatus(meta)}
                        message={
                          getStatus(meta, validating) === "error" &&
                          meta.error
                        }
                      >
                        <RadioGroup {...input}>
                          {
                            Object.keys(genderMap).map(k => <Radio key={k} name={k}>{genderMap[k]}</Radio>)
                          }
                        </RadioGroup>
                      </Form.Item>
                    )}
                  </Field>
                </Form>
                <Form.Action>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                  >
                    提交
                  </Button>
                </Form.Action>
              </form>
            );
          }}
        </FinalForm>

      </Modal.Body>
      <Modal.Footer>

      </Modal.Footer>

    </Modal>




  )
}