
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, message } from 'antd';
import moment from 'moment';
import PerBtn from '../PerBtn';

// 下载文件使用
export const downloadBlobFile = (data, name) => {
  const blob = new Blob([data], { type: 'application/vnd.ms-excel,charset=utf-8' })
  const fileName = name
  if ('download' in document.createElement('a')) { // 非IE下载
    const elink = document.createElement('a')
    elink.download = fileName
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) // 释放URL 对象
    document.body.removeChild(elink)
  } else { // IE10+下载
    navigator.msSaveBlob(blob, fileName)
  }
}

const Export = forwardRef(({
  text = "导出",
  exportName,
  btnProps = {},
  onOkExport = () => Promise.reject(),
  pKey
}, ref) => {

  const [loading, setLoading] = useState(false);
  useImperativeHandle(ref, () => {
    return {};
  });

  return <>
    <PerBtn
      pKey={pKey}
      loading={loading}
      onClick={
        () => Modal.confirm({
          okText: "确定",
          cancelText: "取消",
          title: '确定导出数据？',
          content: <>
            确定根据<b>现有条件</b>，导出{`${exportName || "文件"}`}
          </>,
          onOk() {
            setLoading(true);
            onOkExport()
              .then(res => {
                const { success, data, message: msg, headers } = res
                if (success) {
                  downloadBlobFile(
                    data,
                    decodeURI(headers['content-disposition'].split("''")[1])
                    || `${exportName || '文件' + moment().format("YYYYMMDDHHmmss")}.xlsx`
                  )
                } else {
                  message.error(msg)
                }
              })
              .finally(() => setLoading(false))
          },
        })
      }
      {...btnProps}
    >{text}</PerBtn>
  </>
})


export default Export