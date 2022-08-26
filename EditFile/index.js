
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, message } from 'antd';
import { Attachment } from 'suid';
import constants from '@/utils/constants';
import { EBOC_PRODUCT_SERVICE } from '@/utils/commonUrl';
import { request } from '@/utils';

const { SERVER_PATH } = constants;

// 更新实体关联的附件
export const updateDocIds = (data) =>
  request({
    url: `${SERVER_PATH}/${EBOC_PRODUCT_SERVICE}/attachment/updateDocIds`,
    method: 'POST',
    data
  });

const EditFile = forwardRef(({
  updateFun,
  reqParams = {
    documentIds: "documentIds",
    entityId: "entityId"
  },
  entityId,
  children,
  showCount = true,
  useList = false,
  limtMin,
  limtMax,
  ...props
}, ref) => {

  const [editFile, setEditFile] = useState([]);
  const [editFileVisible, setEditFileVisible] = useState(false);
  const [loading, setLoding] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      getEditFile,
      resetEditFile
    };
  });

  const attachmentRef = useRef();
  const attachmentProps = {
    fileList: editFile,
    showViewType: false,
    serviceHost: `${SERVER_PATH}/edm-service`,
    customBatchDownloadFileName: true,
    viewType: 'list',
    onAttachmentRef: ref => (attachmentRef.current = ref),
    entityId,
    onChange: (files, errorFileCount) => {
      if (errorFileCount === 0) {
        setEditFile(files)
      }
    },
    ...props
  };

  function handleCancel() {
    setEditFileVisible(false);
    // setEditFile([])
  }

  function saveImportExcel() {
    if (limtMin && limtMin > editFile.length) {
      message.error(`至少存在${limtMin}个附件`);
      return
    }

    if (limtMax && limtMax < editFile.length) {
      message.error(`最多存在${limtMax}个附件`);
      return
    }
    setLoding(true)
    let p = Promise.reject()
    if (updateFun) {
      p = updateFun({
        [reqParams.entityId]: entityId,
        [reqParams.documentIds]: editFile.map(res => res.id)
      })
    } else {
      p = updateDocIds({
        [reqParams.entityId]: entityId,
        [reqParams.documentIds]: editFile.map(res => res.id)
      })
    }
    p.then(({ success, message: msg }) => {
      if (success) {
        message.success(msg);
      }
      handleCancel()
    })
      .finally(() => setLoding(false))
  }

  function getEditFile() {
    return editFile
  }

  function resetEditFile() {
    setEditFile([])
  }

  return <>
    {
      useList ? <Attachment {...attachmentProps} /> : <>
        <div onClick={() => setEditFileVisible(true)} style={{ display: "inline-block" }}>
          {children}{showCount ? `：${editFile?.length}` : ''}
        </div>
        <Modal
          title={`附件`}
          visible={editFileVisible}
          // onOk={handleOk}
          onCancel={handleCancel}
          width={"800px"}
          maskClosable={false}
          forceRender={true}
          footer={
            entityId ? [
              <Button
                type="primary"
                loading={loading}
                onClick={() => saveImportExcel()}
              >保存</Button>,
            ] : []
          }
        >
          {
            editFileVisible && <Attachment {...attachmentProps} />
          }
        </Modal>
      </>
    }
  </>
})




export default EditFile