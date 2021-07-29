import { Form, Input, Button, RadioGroup, Radio } from "tea-component";
import React, { useState } from "react";
import { Form as FinalForm, Field } from "react-final-form";
import { getStatus } from "../../../../utils/getStatus";
import { GroupTypeSelect } from "./GroupTypeSelect";
import  ImgCropper  from "../../../../components/UploadFace";
import qunioc from '../../../../assets/icon/qunioc.png'

import "./create-group-form.scss";

const validateOldValue = async (value: string, label: string) => {
  if (!value) {
    return `${label}必填`;
  }
};
const validateFaceUrl = (value: string) => {
  if(!value) {
    return '用户头像地址必填';
  }
}
interface createGroupMemberParams {
  group_member_info_member_role: number;
  group_member_info_identifier: number & string
}
export interface FormValue {
  groupName: string;
  groupAnnouncement: string;
  groupIntroduction: string;
  joinGroupMode: string;
  groupMember?: any;
  groupType: string;
  groupAvatarUrl: string;
}

interface CreateGroupFormProps {
  onSubmit: (formValue: FormValue) => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

export const CreateGroupForm = (props: CreateGroupFormProps): JSX.Element => {
  const { onSubmit, onSuccess, onError, onClose } = props;
  const [groupAvatarUrl, setGroupAvatarUrl] = useState(qunioc)

  const getGroupMember = (userId) => {
    if (userId) {
      return [{
        group_member_info_member_role: 2,
        group_member_info_identifier: userId,
      }]
    }
    return null
  }
  // eslint-disable-next-line
  const _handlerSubmit = async (formValue: FormValue) => {
    let { groupMember, ...params } = formValue
    try {
      // 如有添加管理员
      const groupMangeMember = getGroupMember(groupMember)
      await onSubmit({ ...params, groupMember: groupMangeMember , groupAvatarUrl });
      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };

  const afterUpload = (imgUrl) => {
    setGroupAvatarUrl(imgUrl)
  }
  const beforeUpload = () => {
    setGroupAvatarUrl('')
  }
  return (
    <FinalForm
      onSubmit={_handlerSubmit}
      initialValuesEqual={() => true}
      initialValues={{
        groupType: "0",
        joinGroupMode: "2",
      }}
    >
      {({ handleSubmit, submitting, validating, values }) => {
        const { groupType } = values;
        return (
          <form onSubmit={handleSubmit}>
            <Form layout="fixed" style={{ width: "100%" }}>
              <Field
                  name="groupAvatarUrl"
                  disabled={submitting}
                >
                  {() => (
                    <Form.Item
                      label="群头像"
                    >
                      <ImgCropper value={groupAvatarUrl} afterUpload={afterUpload} beforeUpload={beforeUpload} isShowCropper={true} />
                    </Form.Item>
                  )}
              </Field>
              <Field
                name="groupName"
                disabled={submitting}
                validateOnBlur
                validateFields={[]}
                validate={(value) => validateOldValue(value, "群聊名称")}
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
                validate={(value) => validateOldValue(value, "群类型")}
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
              >
                {({ input, meta }) => (
                  <Form.Item
                    label="设置管理员"
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

              {groupType === "0" && (
                <Field
                  name="joinGroupMode"
                  disabled={submitting}
                  validateOnBlur
                  validateFields={[]}
                  validate={(value) => validateOldValue(value, "入群方式")}
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
                        <Radio name="2">自由加入</Radio>
                        <Radio name="1">需要验证</Radio>
                        <Radio name="0">禁止加群</Radio>
                      </RadioGroup>
                    </Form.Item>
                  )}
                </Field>
              )}
              <Field
                name="groupAnnouncement"
                disabled={submitting}
                validateOnBlur
                validateFields={[]}
                validate={(value) => validateOldValue(value, "群公告")}
              >
                {({ input, meta }) => (
                  <Form.Item
                    required
                    label="群公告"
                    status={getStatus(meta, validating)}
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
              <Field
                name="groupIntroduction"
                disabled={submitting}
              >
                {({ input }) => (
                  <Form.Item
                    label="群简介"
                  >
                    <Input.TextArea
                      {...input}
                      placeholder="请输入群简介"
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
                立即创建
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
