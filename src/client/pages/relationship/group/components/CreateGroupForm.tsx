import { Form, Input, Button, RadioGroup, Radio } from "@tencent/tea-component";
import React from "react";
import { Form as FinalForm, Field } from "react-final-form";
import { getStatus } from "../../../../utils/getStatus";
import { GroupTypeSelect } from "./GroupTypeSelect";

import "./create-group-form.scss";

const validateOldPassword = async (value: string) => {
  if (!value) {
    return "请输入旧密码";
  }
};

export interface FormValue {
  groupName: string;
  groupAnnouncement: string;
  joinGroupMode: string;
  groupMember: string;
  groupType: string;
}

interface CreateGroupFormProps {
  onSubmit: (formValue: FormValue) => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

export const CreateGroupForm = (props: CreateGroupFormProps): JSX.Element => {
  const { onSubmit, onSuccess, onError, onClose } = props;

  // eslint-disable-next-line
  const _handlerSubmit = async (formValue: FormValue) => {
    try {
      await onSubmit(formValue);
      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };

  return (
    <FinalForm
      onSubmit={_handlerSubmit}
      initialValuesEqual={() => true}
      initialValues={{
        groupType: "1",
        joinGroupMode: "2",
      }}
    >
      {({ handleSubmit, submitting, validating }) => {
        return (
          <form onSubmit={handleSubmit}>
            <Form layout="fixed" style={{ width: "100%" }}>
              <Field
                name="groupName"
                disabled={submitting}
                validateOnBlur
                validateFields={[]}
                validate={validateOldPassword}
              >
                {({ input, meta }) => (
                  <Form.Item
                    required
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

              <Field
                name="groupType"
                disabled={submitting}
                validateOnBlur
                validateFields={[]}
                validate={validateOldPassword}
              >
                {({ input, meta }) => (
                  <Form.Item
                    required
                    label="群类型"
                    status={getStatus(meta, validating)}
                    message={
                      getStatus(meta, validating) === "error" && meta.error
                    }
                  >
                    <GroupTypeSelect
                      {...input}
                      type="simulate"
                      size="full"
                      appearance="button"
                      disabled={submitting}
                    />
                  </Form.Item>
                )}
              </Field>

              <Field
                name="groupMember"
                disabled={submitting}
                validateOnBlur
                validateFields={[]}
                validate={validateOldPassword}
              >
                {({ input, meta }) => (
                  <Form.Item
                    required
                    label="设置管理员"
                    status={getStatus(meta, validating)}
                    message={
                      getStatus(meta, validating) === "error" && meta.error
                    }
                  >
                    <Input
                      {...input}
                      placeholder="请输入管理员UID"
                      size="full"
                      disabled={submitting}
                    />
                  </Form.Item>
                )}
              </Field>

              <Field
                name="joinGroupMode"
                disabled={submitting}
                validateOnBlur
                validateFields={[]}
                validate={validateOldPassword}
              >
                {({ input, meta }) => (
                  <Form.Item
                    required
                    label="入群方式"
                    status={getStatus(meta, validating)}
                    message={
                      getStatus(meta, validating) === "error" && meta.error
                    }
                  >
                    <RadioGroup {...input}>
                      <Radio name="1">仅管理员可邀请</Radio>
                      <Radio name="2">全体成员可邀请</Radio>
                    </RadioGroup>
                  </Form.Item>
                )}
              </Field>

              <Field
                name="groupAnnouncement"
                disabled={submitting}
                validateOnBlur
                validateFields={[]}
                validate={validateOldPassword}
              >
                {({ input, meta }) => (
                  <Form.Item
                    required
                    label="群公告"
                    status={getStatus(meta, validating)}
                    message={
                      getStatus(meta, validating) === "error" && meta.error
                    }
                  >
                    <Input.TextArea
                      {...input}
                      placeholder="请输入群公告"
                      size="full"
                      disabled={submitting}
                    />
                  </Form.Item>
                )}
              </Field>
            </Form>
            <Form.Action>
              <Button
                className="btn"
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                添加
              </Button>
              <Button
                className="btn"
                loading={submitting}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClose();
                }}
              >
                取消
              </Button>
            </Form.Action>
          </form>
        );
      }}
    </FinalForm>
  );
};
