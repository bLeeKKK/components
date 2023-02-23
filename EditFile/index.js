import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, message, Divider } from 'antd';
import { Attachment } from '@sei/suid';
import { useUpdateEffect } from 'ahooks';
import constants from '@/utils/constants';
import { request } from '@/utils';

const { SERVER_PATH } = constants;

// 更新实体关联的附件
export const updateDocIds = data =>
  request({
    url: `${SERVER_PATH}/edm-service/document/bindBusinessDocuments`,
    method: 'POST',
    data,
  });

/**
 * @description: 附件组件
 * @param {Function} updateFun 绑定附件到后台
 * @param {Object} reqParams 绑定参数定义key值
 * @param {string} entityId 绑定id
 * @param {ReactDOM} children 弹窗模式，触发打开弹窗的dom
 * @param {boolean} windMode 是否启动，弹窗模式
 * @param {boolean} directlyBind 上传附件后是否直接绑定
 * @param {boolean} bindBtn 是否展示绑定按钮
 * @param {number} limtMin 最大上传文件数量
 * @param {number} limtMax 最小上传文件数量
 * */

const EditFile = forwardRef(
  (
    {
      updateFun,
      reqParams = {
        documentIds: 'documentIds',
        entityId: 'entityId',
      },
      entityId,
      children,
      windMode = false,
      directlyBind = false,
      bindBtn = false,
      limtMin,
      limtMax,
      allowUpload = true,
      ...props
    },
    ref,
  ) => {
    const [editFile, setEditFile] = useState([]);
    const [editFileVisible, setEditFileVisible] = useState(false);
    const [loading, setLoding] = useState(false);
    const attachmentRef = useRef();

    // 是否执行绑定附件常量
    const BIND_FILE = useRef(false);

    useImperativeHandle(ref, () => {
      return {
        getEditFile,
        resetEditFile,
        saveImportExcel, // 绑定附件
      };
    });

    useUpdateEffect(() => {
      if (directlyBind && editFile.some(res => res.status === "uploading") && entityId) {
        BIND_FILE.current = true;
      }

      if (BIND_FILE.current && editFile.every(res => res.status === "done")) {
        saveImportExcel();
        BIND_FILE.current = false;
      }
    }, [editFile]);

    const attachmentProps = {
      fileList: editFile,
      showViewType: false,
      serviceHost: `${SERVER_PATH}/edm-service`,
      customBatchDownloadFileName: true,
      // viewType: 'card',
      allowUpload,
      onAttachmentRef: ref => {
        attachmentRef.current = ref
      },
      entityId,
      onChange: (files, errorFileCount) => {
        if (errorFileCount === 0) {
          // console.log(files)
          setEditFile(files);
          // if (bindBtnShow && files.every(res => res.status === "done")) saveImportExcel(undefined, files)
        }
      },
      ...props,
    };

    const handleCancel = () => {
      setEditFileVisible(false);
      // 清空的话，关闭弹窗列表就请空了，这里不能清空列表
      // setEditFile([])
    }

    function saveImportExcel(taskId = entityId, inFiles = editFile) {

      if (limtMin && limtMin > inFiles.length) {
        message.error(`至少存在${limtMin}个附件`);
        return;
      }

      if (limtMax && limtMax < inFiles.length) {
        message.error(`最多存在${limtMax}个附件`);
        return;
      }

      setLoding(true);
      let p = Promise.reject();
      if (updateFun) {
        p = updateFun({
          [reqParams.entityId]: taskId,
          [reqParams.documentIds]: inFiles.map(res => res.id),
        });
      } else {
        p = updateDocIds({
          [reqParams.entityId]: taskId,
          [reqParams.documentIds]: inFiles.map(res => res.id),
        });
      }
      p
        .then(({ success, message: msg }) => {
          if (success) {
            message.success(msg);
          }
          if (!directlyBind) handleCancel();
        })
        .finally(() => setLoding(false));
      return p
    }

    function getEditFile() {
      return editFile;
    }

    function resetEditFile() {
      setEditFile([]);
    }

    return (
      <>

        {/* 弹窗模式 */}
        {
          windMode
            ? (<>
              <div onClick={() => setEditFileVisible(true)} style={{ display: 'inline-block' }}>
                {children}
              </div>
              <Modal
                title="附件"
                visible={editFileVisible}
                // onOk={handleOk}
                onCancel={handleCancel}
                width="800px"
                maskClosable={false}
                forceRender
                footer={
                  bindBtn && entityId && allowUpload
                    ? [
                      <Button key="save" type="primary" loading={loading} onClick={() => saveImportExcel()}>
                        保存
                      </Button>,
                    ]
                    : []
                }
              >
                {editFileVisible && <Attachment {...attachmentProps} />}
              </Modal>
            </>)
            : <>
              {/* 非弹窗模式 */}
              <Attachment {...attachmentProps} />
              {
                entityId && bindBtn && allowUpload
                  ? <>
                    <Divider />
                    <div style={{ textAlign: "right" }}>
                      <Button onClick={() => saveImportExcel()} type="primary" >绑定附件</Button>
                    </div>
                  </>
                  : null
              }
            </>
        }


      </>
    );
  },
);

export default EditFile;
