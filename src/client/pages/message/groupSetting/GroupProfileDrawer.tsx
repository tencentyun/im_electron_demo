/**
 * 群主修改群资料， 消息提示方式与群名片 群成员可修改，不在此展示
 */
import { DialogRef, useDialog } from "../../../utils/react-use/useDialog";
import { Drawer, H3, message } from "tea-component";
import { Form, Input, Button, Checkbox, Select } from "tea-component";
import React, { useState, useEffect } from "react";
import { Form as FinalForm, Field } from "react-final-form";
import "./member-list-drawer.scss";
import  ImgCropper  from "../../../components/UploadFace";
import { getStatus } from "../../../utils/getStatus";
import { modifyGroupInfo } from "../api";

export interface GroupProfileRecordsType {
  groupDetail: Partial<State.conversationItem['conv_profile']>;
}

const joinOptions = [
  { value: '2', text: "自由加入" },
  { value: '1', text: "需要验证" },
  { value: '0', text: "禁止加群" },
];

const validateOldValue = async (value: string, label: string) => {
  if (!value) {
    return `${label}必填`;
  }
};

export const GroupProfileDrawer = (props: {
  onSuccess?: () => void;
  popupContainer?: HTMLElement;
  dialogRef: DialogRef<GroupProfileRecordsType>;
}): JSX.Element => {
  const { dialogRef, popupContainer,onSuccess } = props;
 
  const [visible, setShowState, defaultForm] =
    useDialog<GroupProfileRecordsType>(dialogRef, {});
  const groupDetail = defaultForm.groupDetail || {}
  const [avatarUrl, setAvatarUrl] = useState(groupDetail.group_detial_info_face_url)
  const {
    group_detial_info_face_url,
    group_detial_info_group_name,
    group_detial_info_group_type,
    group_detial_info_add_option,
    group_detial_info_notification,
    group_detial_info_introduction,
    group_detial_info_is_shutup_all
  } = groupDetail

   // eslint-disable-next-line
   const _handlerSubmit = async (formValue) => {
    const { groupName, groupAnnouncement, groupIntroduction, group_detial_info_face_url, joinGroupMode, muteFlag} = formValue
    try {
      const modifyParams = {
        ...(group_detial_info_group_name != groupName && {group_modify_info_param_group_name: groupName} ),
        ...(group_detial_info_notification != groupAnnouncement && {group_modify_info_param_notification: groupAnnouncement} ),
        ...(group_detial_info_introduction != groupIntroduction && {group_modify_info_param_introduction: groupIntroduction} ),
        ...(group_detial_info_face_url != avatarUrl && {group_modify_info_param_face_url: avatarUrl || group_detial_info_face_url} ),
        ...(group_detial_info_add_option != joinGroupMode && {group_modify_info_param_add_option: Number(formValue.joinGroupMode)} ),
        ...(group_detial_info_is_shutup_all != muteFlag && {group_modify_info_param_is_shutup_all: muteFlag} )
      }
      const length = Object.keys(modifyParams).length
      if (length > 0) {
        await modifyGroupInfo({
          groupId: groupDetail.group_detial_info_group_id,
          modifyParams,
        });
        message.success({ content: '修改成功' });
        onSuccess && onSuccess();
      }
      onClose()
    } catch (e) {
      console.log(e);
      message.error({ content: '修改失败' });
    }
  }

  const onClose = () => {
    setShowState(false);
  };
  // 头像地址
  const afterUpload = (imgUrl) => {
    setAvatarUrl(imgUrl)
  }
  const beforeUpload = () => {
    setAvatarUrl('')
  }

  return (
    <Drawer
      visible={visible}
      title={
        <div className="member-list-drawer--title">
          <H3>群资料修改</H3>
        </div>
      }
      className="member-list-drawer"
      popupContainer={popupContainer}
      onClose={onClose}
    >
      <div style={{padding: '20px 10px 40px 20px'}}>
        <FinalForm
          onSubmit={_handlerSubmit}
          initialValuesEqual={() => true}
          initialValues={{
            groupAvatarUrl: group_detial_info_face_url,
            groupName: group_detial_info_group_name,
            groupType: group_detial_info_group_type,
            joinGroupMode: String(group_detial_info_add_option),
            groupAnnouncement: group_detial_info_notification,
            groupIntroduction: group_detial_info_introduction,
            muteFlag: group_detial_info_is_shutup_all
          }}
        >
          {({ handleSubmit, submitting, validating, values }) => {
            const { groupType, groupAvatarUrl } = values;
            return (
              <form onSubmit={handleSubmit}>
                <Form layout="vertical" style={{ width: "100%" }}>
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
                  {groupType == "0" && (
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
                          <Select
                            {...input}
                            size="full"
                            type="simulate"
                            appearance="button"
                            disabled={submitting}
                            options={joinOptions}
                          />
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
                 
                  <Field
                    name="muteFlag"
                    disabled={submitting}
                  >
                    {({ input }) => (
                      <Form.Item
                        label="群禁言"
                      >
                        <Checkbox
                          {...input}
                          disabled={submitting}
                        />
                      </Form.Item>
                    )}
                  </Field>
                </Form>
                <Form.Action style={{ textAlign: 'center'}}>
                  <Button
                    className="btn"
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                  >
                    保存修改
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
      </div>
    </Drawer>
  );
};
