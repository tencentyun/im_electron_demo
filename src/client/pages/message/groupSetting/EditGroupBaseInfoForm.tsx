import { Form, Input, Button, Modal } from "tea-component";
import React, { useState } from "react";
import { Form as FinalForm, Field } from "react-final-form";
import { getStatus } from "../../../utils/getStatus";
import ImgCropper from "../../../components/UploadFace";

const reg = /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;

const validateFaceUrl = (value: string) => {
  // if(!value) {
  //   return '用户头像地址必填';
  // }

  if (value && !reg.test(value)) {
    return 'url不合法';
  }
}

const validateValue = async (value: string, label: string) => {
  if (!value) {
    return `${label}必填`;
  }
};

export interface FormValue {
  groupName: string;
  groupFaceUrl: string;
}

interface Props {
  onSubmit: (formValue: FormValue) => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
  onClose?: () => void;
  initialValues: {
    groupName: string;
    groupFaceUrl: string;
  }
}

export const EditGroupBaseInfoForm = (props: Props): JSX.Element => {
  const { onSubmit, onSuccess, onError, initialValues } = props;

  // eslint-disable-next-line
  const _handlerSubmit = async (formValue: FormValue) => {
    formValue.groupFaceUrl = imgUrl
    console.log('formValue', formValue)
    console.log('imgUrl', imgUrl)
    try {
      await onSubmit(formValue);
      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };

  const open = (e) => {
    e.preventDefault();
    setVisible(true)
    return false
  
  };
  const close = () => setVisible(false);
  const [visible, setVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [formValue, setFormValue] = useState({});

  function afterCropper(base64) {
    console.log('base64', base64)
  }
  function afterUpload(imgUrl) {
    console.log('imgUrl', imgUrl)
    setImgUrl(imgUrl)
  }
  function cropperFile(file) {
    console.log('file', file)
  }
  function beforeUpload(file) {
    console.log('上传前file', file)
  }

  return (
    <>
      
      <FinalForm
        onSubmit={_handlerSubmit}
        initialValuesEqual={() => true}
        initialValues={
          initialValues
        }
      >
        {({ handleSubmit, submitting, validating }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Form layout="fixed" style={{ width: "100%" }}>

                <Field
                  name="groupFaceUrl"
                  disabled={submitting}
                  validateOnBlur
                  validateFields={[]}
                  validate={validateFaceUrl}
                >
                  {({ input, meta }) => (
                    <Form.Item
                      // required
                      label="群头像"
                      status={getStatus(meta, validating)}
                      message={
                        getStatus(meta, validating) === "error" && meta.error
                      }
                    >
{/* <Button
        className="title--right__button"
        type="primary"
        onClick={(e) => open(e)}
      >
        上传头像
      </Button> */}
      <ImgCropper {...input} isShowCropper={true} afterUpload={afterUpload}></ImgCropper>
                      {/* <Input
                        {...input}
                        placeholder="请输入群头像地址"
                        size="full"
                        style={{ display: "none" }}
                        disabled={submitting}
                      /> */}
                    </Form.Item>
                  )}
                </Field>

                <Field
                  name="groupName"
                  disabled={submitting}
                  validateOnBlur
                  validateFields={[]}
                // validate={(value) => validateValue(value , '群名称')}
                >
                  {({ input, meta }) => (
                    <Form.Item
                      // required
                      label="群聊名称"
                      status={getStatus(meta, validating)}
                      message={
                        getStatus(meta, validating) === "error" && meta.error
                      }
                    >
                      <Input
                        {...input}
                        placeholder="请输入"
                        size="full"
                        disabled={submitting}
                      />
                    </Form.Item>
                  )}
                </Field>



              </Form>
              <Form.Action>
                <Button
                  style={{ borderRadius: '4px' }}
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                >
                  确认
                </Button>
              </Form.Action>
            </form>
          );
        }}
      </FinalForm>
    </>
  );
};
