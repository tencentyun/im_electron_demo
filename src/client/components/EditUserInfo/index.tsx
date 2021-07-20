import React, { FC, useEffect, useState } from "react"
import './index.scss'
import {
    Form,
  Input,
  RadioGroup,
  Radio,
  Button,
  Modal,
  Upload
} from "tea-component";
import { Form as FinalForm, Field } from "react-final-form";
type GENDER = 'Gender_Type_Female' | 'Gender_Type_Male' | 'Gender_Type_Unknown'

const genderMap = {
  'Gender_Type_Male': '男',
  'Gender_Type_Female': '女',
  'Gender_Type_Unknown': '不显示'
}

interface UserInfo  {
    avatar?: string,
    nick?: string,
    gender?: GENDER,
  userID?: string,
  visible: boolean,
  onChange?: (val?:boolean) => void,
  onClose:(val?:boolean)=>void
}

export const UserInfo: FC<UserInfo> = ({visible,onChange,onClose}): JSX.Element => {
  const [isShow, setVisible] = useState(visible)
  const close = () => {
    setVisible(false)
    onClose(false)
  }

  useEffect(() => {
    setVisible(visible)
    onChange(visible)
    },[visible])


function getStatus(meta, validating?) {
  if (meta.active && validating) {
    return "validating";
  }
  if (!meta.touched) {
    return null;
  }
  return meta.error ? "error" : "success";
  }
    async function onSubmit(values) {
    alert(JSON.stringify(values));
  }
    return (
      <Modal visible={isShow} caption="编辑个人资料" onClose={close}>
        <Modal.Body>
               
            <FinalForm
            onSubmit={onSubmit}
            initialValuesEqual={() => true}
            initialValues={{
              avatar:'',
              nick: '',
              gender: '',
            }}
          >
            {({ handleSubmit, validating, submitting }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <Form>
                    <Field
                      name="avatar"
                      validateFields={[]}
                    >
                      {({ input, meta }) => (
                        <Form.Item
                          label="头像"
                        >
                        <Upload
        action="https://run.mocky.io/v3/68ed7204-0487-4135-857d-0e4366b2cfad"
      >
        <Button>点击上传</Button>
      </Upload>
                        </Form.Item>
                      )}
                    </Field>
                    <Field
                      name="nick"
                      validateOnBlur
                      validateFields={[]}
                      validate={async value => {
                        return !value || value.length < 4
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
                            disabled
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
                        value.length < 1 ? "请至少选择一个哦" : undefined
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
                              Object.keys(genderMap).map(k => <Radio key={k} name={k}>{ genderMap[k]}</Radio>)
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