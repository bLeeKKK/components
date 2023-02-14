import React, { useState, useRef } from 'react';
import { Button, message, Modal, Tag, Tooltip, Dropdown, Menu, Icon } from 'antd';
import { ExtTable } from 'suid';
import { downloadBlobFile } from '../Export';
import PerBtn from '@/components/PerBtn';

const checkMap = res => ({
  flag: !res.exceptionMessage,
  message: !res.exceptionMessage ? (
    '无'
  ) : (
    <Tooltip placement="top" title={<>{res.exceptionMessage}</>}>
      {res.exceptionMessage}
    </Tooltip>
  ),
  ...res,
});

function Import({
  btnProps = {},
  // btnDownProps = {},
  // downloadTemplate = () => Promise.reject(),
  textImport = '批量导入',
  downloadProps = {},
  pKey,
  columns = [],
  checkListData = () => Promise.reject(),
  batchSave = () => Promise.reject(),
  callBcak = () => {},
  mapCheck = checkMap,
  maxSize = 10, // 最大上传 10mb 的文件
  inputProps = {},
  flagItem = {
    title: '校验状态',
    dataIndex: 'flag',
    render: t => (t ? <Tag color="green">成功</Tag> : <Tag color="magenta">失败</Tag>),
  },
}) {
  const [loadingDataImport, setLoadingDataImport] = useState(false);
  const [fileVisible, setFileVisible] = useState(false);
  const [listData, setListData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const flieInput = useRef();

  const handleSelectedRows = rowKeys => {
    setSelectedRowKeys(rowKeys);
    // setSelectedRow(rows);
  };

  function checkFile(data) {
    const fd = new FormData();
    const file = data.target.files[0];

    if (maxSize <= file.size / 1024 / 1024) {
      message.warn(`最大上传文件大小为：${maxSize}MB以内`);
      return;
    }

    fd.append('file', file);
    setLoadingDataImport(true);
    if (flieInput.current) {
      flieInput.current.value = '';
    }
    checkListData(fd)
      .then(res => {
        if (res.success) {
          const newData = (res.data || []).map(mapCheck);
          if (newData?.length === 0) {
            message.warning('校验后数据为空，请重新上传');
          }
          setListData(newData);
        } else {
          setListData([]);
          message.error(res.message);
        }
      })
      .finally(() => {
        setLoadingDataImport(false);
      });
  }

  function saveImportExcel() {
    Modal.confirm({
      okText: '确认',
      cancelText: '取消',
      title: '确定导入',
      content: '将导入所有校验【成功】的数据！',
      onOk() {
        const data = listData.filter(re => re.flag);
        setLoadingDataImport(true);
        batchSave(data)
          .then(({ message: msg, success }) => {
            if (success) {
              message.success(msg);
              callBcak();
              setFileVisible(false);
              setListData([]);
            } else {
              message.error(msg);
            }
          })
          .finally(() => {
            setLoadingDataImport(false);
          });
      },
      onCancel() {},
    });
  }

  return (
    <>
      <DownLoadBtn {...downloadProps} />
      <PerBtn
        onClick={() => {
          setFileVisible(true);
        }}
        pKey={pKey}
        {...btnProps}
      >
        {textImport}
      </PerBtn>
      <Modal
        title="导入"
        visible={fileVisible}
        okText="确定"
        cancelText="取消"
        onCancel={() => {
          setFileVisible(false);
          setListData([]);
        }}
        width="90%"
        maskClosable={false}
        forceRender
        footer={[
          <Button
            type="primary"
            key="import"
            onClick={() => saveImportExcel()}
            loading={loadingDataImport}
            disabled={listData.some(res => !res.flag) || listData.length === 0}
          >
            导入
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', margin: '0 0 10px 0' }}>
          <Button type="primary" loading={loadingDataImport} style={{ position: 'relative' }}>
            选择文件
            <input
              ref={flieInput}
              type="file"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                opacity: '0',
              }}
              onChange={checkFile}
              accept="excel/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              {...inputProps}
            />
          </Button>
        </div>
        {fileVisible && (
          <ExtTable
            bordered
            columns={[
              flagItem,
              { title: '校验信息', dataIndex: 'message', width: 200 },
              ...columns,
            ].map(_ => ({ ..._, align: 'center' }))}
            showSearch={false}
            height={500}
            rowKey={(item, index) => item.id || `错误数据${index}`}
            allowCancelSelect
            size="small"
            selectedRowKeys={selectedRowKeys}
            onSelectRow={handleSelectedRows}
            remotePaging
            storageId="GIFTACCOUNT_IMPORT"
            ellipsis={false}
            // checkbox={{ multiSelect: true }}
            dataSource={listData}
          />
        )}
      </Modal>
    </>
  );
}

const DownLoadBtn = function({ btn, pKey }) {
  const [loading, setLoading] = useState(false);
  const flag = Array.isArray(btn);

  if (!btn) {
    return '模板下载必传属性“btn”';
  }

  return flag ? (
    <Dropdown
      overlay={
        <Menu>
          {btn.map((re, index) => (
            <Menu.Item
              key={`${index}-${re.name}`}
              onClick={() => downloadImport(re.downloadImport, re.name)}
            >
              {re.name}
            </Menu.Item>
          ))}
        </Menu>
      }
      placement="bottomCenter"
    >
      <PerBtn loading={loading} pKey={pKey}>
        导入模板
        <Icon type="down" />
      </PerBtn>
    </Dropdown>
  ) : (
    <PerBtn
      onClick={() => downloadImport(btn.downloadImport, btn.name)}
      loading={loading}
      pKey={pKey}
      {...btn}
    >
      {btn.name || '下载导入模板'}
    </PerBtn>
  );

  function downloadImport(fn, name) {
    if (!fn) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('下载地址不存在');
    }
    setLoading(true);
    fn()
      .then(res => {
        const { success, data, message: msg } = res;
        if (success) {
          downloadBlobFile(data, `${name}.xlsx`);
        } else {
          message.error(msg);
        }
      })
      .finally(() => setLoading(false));
  }
};

export default Import;
