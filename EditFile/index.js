import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, message, Divider } from 'antd';
import { Attachment } from '@sei/suid';
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
 * @param {boolean} directlyBind 上传组件后是否直接绑定
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
      limtMin,
      limtMax,
      ...props
    },
    ref,
  ) => {
    const [editFile, setEditFile] = useState([]);
    const [editFileVisible, setEditFileVisible] = useState(false);
    const [loading, setLoding] = useState(false);
    const attachmentRef = useRef();

    useImperativeHandle(ref, () => {
      return {
        getEditFile,
        resetEditFile,
        saveImportExcel,
      };
    });

    const attachmentProps = {
      fileList: editFile,
      showViewType: false,
      serviceHost: `${SERVER_PATH}/edm-service`,
      customBatchDownloadFileName: true,
      viewType: 'card',
      onAttachmentRef: ref => {
        attachmentRef.current = ref

        // if (ref?.handlerUpload) {
        //   const fun = ref?.handlerUpload
        //   ref.handlerUpload = (file) => {
        //     const arr = ref?.props?.fileList || []
        //     saveImportExcel(undefined, [...arr, file])
        //     fun(file);
        //   }
        // }
      },
      entityId,
      onChange: (files, errorFileCount) => {
        if (errorFileCount === 0) {
          // console.log(files)
          setEditFile(files);
          // saveImportExcel(undefined, files)
        }
      },
      // extra: directlyBind
      //   ? <Button onClick={() => saveImportExcel()} type={'primary'} >保存绑定</Button>
      //   : undefined,
      ...props,
    };

    function handleCancel() {
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
          handleCancel();
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
        {
          windMode
            ? (<>
              <div onClick={() => setEditFileVisible(true)} style={{ display: 'inline-block' }}>
                {children}
              </div>
              <Modal
                title={`附件`}
                visible={editFileVisible}
                // onOk={handleOk}
                onCancel={handleCancel}
                width={'800px'}
                maskClosable={false}
                forceRender={true}
                footer={
                  entityId
                    ? [
                      <Button key={'save'} type="primary" loading={loading} onClick={() => saveImportExcel()}>
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
              <Attachment {...attachmentProps} />
              {
                directlyBind
                  ? <>
                    <Divider />
                    <div style={{ textAlign: "right" }}>
                      <Button onClick={() => saveImportExcel()} type={'primary'} >绑定附件</Button>
                    </div>
                  </>
                  : undefined
              }
            </>
        }
      </>
    );
  },
);

export default EditFile;
