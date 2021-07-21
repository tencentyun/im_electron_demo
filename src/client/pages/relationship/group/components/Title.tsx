import { Button ,Modal,Form} from "tea-component";
import React, { useState } from "react";
import { useDialogRef } from "../../../../utils/react-use/useDialog";
import { GroupList } from "../api";
import { CreateGroupDialog } from "./CreateGroupDialog";
import  ImgCropper  from "../../../../components/UploadFace";
import "./title.scss";

const wait = (time) =>
  new Promise((reslove) => {
    setTimeout(() => reslove(true), time);
  });

export const Title = (props: {
  onRefresh: () => Promise<GroupList>;
}): JSX.Element => {
  const { onRefresh } = props;
  const createGroupDialogRef = useDialogRef();
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);
        
  function afterCropper(base64) {
     console.log('base64',base64)
  }
  function afterUpload(imgUrl) {
     console.log('imgUrl',imgUrl)
  }
  function cropperFile(file) {
     console.log('file',file)
  }
  function beforeUpload(file) {
     console.log('上传前file',file)
  }
  return (
    <>
      <div className="title">
        <div className="title--left">
          <span className="title--left__icon" />
          <span className="title--left__text">我的群组</span>
        </div>
        <div>
          <Button
            className="title--right__button"
            type="primary"
            onClick={() => createGroupDialogRef.current.open()}
          >
            创建群聊
          </Button>
          {/* 放开这里的注释即可查看调用截图组件的调用 */}
          {/* <Button
            className="title--right__button"
            type="primary"
            onClick={() =>open()}
          >
            上传头像
          </Button> */}
        </div>
      </div>

      <Modal visible={visible} caption="对话框标题" onClose={close}>
        <Modal.Body>
        <Form>
            <Form.Item label="头像(不裁剪)">
              <ImgCropper isShowCropper={false} afterCropper={afterCropper} afterUpload={afterUpload} cropperFile={cropperFile} beforeUpload={beforeUpload}></ImgCropper>
            </Form.Item>
            <Form.Item label="头像">
              <ImgCropper cropperOption={{style:{width:'200px',height:'100px'}}} afterCropper={afterCropper} afterUpload={afterUpload} cropperFile={cropperFile} beforeUpload={beforeUpload}></ImgCropper>
            </Form.Item>
            <Form.Item label="默认头像">
              <ImgCropper afterCropper={afterCropper} afterUpload={afterUpload} cropperFile={cropperFile} beforeUpload={beforeUpload}></ImgCropper>
            </Form.Item>
            </Form>
        
        </Modal.Body>
      </Modal>
      <CreateGroupDialog
        dialogRef={createGroupDialogRef}
        onSuccess={async () => {
          await wait(1000);
          await onRefresh();
        }}
      />
    </>
  );
};
