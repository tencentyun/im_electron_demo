import React, { FC, useEffect, useState } from "react"
import './index.scss'
import {
    Form,
  Input,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  InputNumber,
  Button,
  Modal
} from "tea-component";
import { Form as FinalForm, Field } from "react-final-form";
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    await sleep(1500);
    alert(JSON.stringify(values));
  }
    return (
      <Modal visible={isShow} caption="编辑个人资料" onClose={close}>
        <Modal.Body>
               
            <FinalForm
            onSubmit={onSubmit}
            initialValuesEqual={() => true}
            initialValues={{
              age: 18,
              hobbies: [],
            }}
          >
            {({ handleSubmit, validating, submitting }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <Form>
                    <Field
                      name="nick"
                      validateOnBlur
                      validateFields={[]}
                      validate={async value => {
                        await sleep(1500);
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
                        >
                          <RadioGroup {...input}>
                            {
                              Object.keys(genderMap).map(k=>  <Radio name={k}>{ genderMap[k]}</Radio>)
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