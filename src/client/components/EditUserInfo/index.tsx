import React, { FC, useEffect, useState } from "react"
import './index.scss'
import {
  Modal,
  Button,
    Form,
  Input,
    RadioGroup,
  Radio,
} from "tea-component";
import { useForm, Controller } from "react-hook-form";

type GENDER = 'Gender_Type_Female' | 'Gender_Type_Male' | 'Gender_Type_Unknown'

const genderMap = {
  'Gender_Type_Male': '男',
  'Gender_Type_Female': '女',
  'Gender_Type_Unknown': '不显示'
}

interface UserInfo  {
    avatarUrl?: string,
    nick?: string,
    gender?: GENDER,
  userID?: string,
  visible: boolean,
  onChange?: (val?) => void,
  onClose:(val?)=>void
}
  async function onSubmit(values) {
    alert(JSON.stringify(values));
  }

export const UserInfo: FC<UserInfo> = ({ avatarUrl, nick,gender,userID,visible,onChange,onClose}): JSX.Element => {
  const { control, handleSubmit, formState, errors } = useForm({ mode: "all" });
  const [isShow, setVisible] = useState(visible)
  const close = () => {
    setVisible(false)
    onClose(false)
  }

  useEffect(() => {
    setVisible(visible)
    onChange(visible)
    },[visible])


      function getStatus(meta) {
    if (!meta.isDirty && !formState.isSubmitted) {
      return null;
    }
    return meta.invalid ? "error" : "success";
  }
    return (
      <Modal visible={isShow} caption="编辑个人资料" onClose={close}>
            <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
            <Form layout='default'>
              <Controller
                name="avatar"
                control={control}
                defaultValue=""
                render={(input) => (
                 <Form.Item label="头像">
                  <Input {...input} autoComplete="off" placeholder="你是谁" />
                </Form.Item>
                )}
              />
              <Controller
                name="nick"
                control={control}
                defaultValue=""
                render={(input) => (
                 <Form.Item label="姓名">
                    <Input {...input} placeholder="你是谁" />
                  </Form.Item>
                )}
              />
             {/* <Controller
                name="gender"
                control={control}
                defaultValue= {[]}
              
                render={({ value, onChange }) => (
                  <Form.Item label="性别" status={getStatus(meta)}>
                    <RadioGroup value={value} onChange={onChange}>
                      {
                        Object.keys(genderMap).map(k=>  <Radio name={k}>{ genderMap[k]}</Radio>)
                      }
                    </RadioGroup>
                  </Form.Item>
                )}
              /> */}
            
             <Controller
                name="sex"
                defaultValue={null}
                control={control}
                rules={{
                  validate: value => (!value ? "请选择性别" : undefined),
                }}
                render={({ value, onChange }, meta) => (
                  <Form.Item
                    label="性别"
                    status={getStatus(meta)}
                    message={errors.sex?.message}
                  >
                    <RadioGroup value={value} onChange={onChange}>
                      <Radio name="male">男</Radio>
                      <Radio name="female">女</Radio>
                    </RadioGroup>
                  </Form.Item>
                )}
              />
            </Form>
       
         
       
        </Modal.Body>
        <Modal.Footer>
          <Form.Action>
            <Button type="primary"  htmlType="submit">保存</Button>
            <Button onClick={close}>取消</Button>
          </Form.Action>
        </Modal.Footer>
        </form>
      </Modal>
    )
}