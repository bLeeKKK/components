import React, { useState } from 'react';
import { Button, Modal, Input, message, Select, Result, Divider, Tag } from 'antd';
import moment from 'moment';
import PerBtn from '@/components/PerBtn';
import styles from './index.less';
import { downloadBlobFile } from '../utils';
// import { ExtTable } from '@sei/suid';
import MyTable from '../MyTable';

const { Option } = Select;

/**
 * @param {string} pKey 权限控制key
 */
export default function Import({
                                 pKey,
                                 downloadTemplate,
                                 importData,
                                 repeatStr,
                                 templateName = 'name',
                                 showColumns = [],
                                 callback,
                                 recordUrl,
                                 noType,
                                 describeFunc,
                               }) {
  const [file, setFile] = useState();
  const [visible, setVisible] = useState(false); // 上传弹窗
  const [visibleShow, setVisibleShow] = useState(false); // 展示弹窗
  const [visibleRecord, setVisibleRecord] = useState(false); // 记录
  const [showData, setShowData] = useState(); // 展示用数据
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('overwrite');

  const opOpen = () => {
    setVisible(true);
  };

  function selectFile(e) {
    setFile(e.target.files[0]);
  }

  function dt() {
    setLoading(true);
    downloadTemplate()
      .then(res => {
        const { success, data, message: msg, headers } = res;
        if (success) {
          const name = headers['content-disposition']?.split("''")[1];
          downloadBlobFile(
            data,
            name ? decodeURI(name) : `${templateName + moment().format('YYYYMMDDHHmmss')}.xlsx`,
          );
        } else {
          message.error(msg);
        }
      })
      .finally(() => setLoading(false));
  }

  const onCancel = () => {
    setVisible(false);
    setFile(undefined);
  };

  const onOk = () => {
    if (!file) {
      message.warning('请选中可导入文件');
      return;
    }
    setLoading(true);
    const params = { type, file };
    if (noType) delete params.type;
    importData(params)
      .then(({ success, message: msg, data }) => {
        if (success) {
          message.success(msg);
          onCancel();
          setVisibleShow(true);
          setShowData(data);
          if (callback) callback();
        } else {
          message.error(msg);
        }
      })
      .finally(() => setLoading(false));
  };

  const onCancelShow = () => {
    setVisibleShow(false);
    setShowData(undefined);
  };

  const onCancelRecord = () => {
    setVisibleRecord(false);
  };

  const recordOpen = () => {
    setVisibleRecord(true);
  };

  const describe = (
    <span>
      {describeFunc ? (
        describeFunc(showData)
      ) : (
        <>
          导入总数数据{showData?.count}条，覆盖{showData?.overwriteCount}条，跳过
          {showData?.skipCount}条，导入成功
          <span style={{ color: 'green' }}>{showData?.successCount}</span>条，导入失败
          <span style={{ color: 'red' }}>{showData?.failCount}</span>条（成功数包含了覆盖数）
        </>
      )}
    </span>
  );

  const columns = [
    {
      title: '校验状态',
      dataIndex: 'id',
      render: t => (t ? <Tag color="green">成功</Tag> : <Tag color="magenta">失败</Tag>),
    },
    { title: '错误信息', dataIndex: 'errorMessage', width: 300 },
    ...showColumns,
  ];

  return (
    <>
      <PerBtn pKey={pKey} onClick={opOpen}>
        导入
      </PerBtn>
      <Modal
        title="导入"
        visible={visible}
        okText="导入"
        okButtonProps={{ loading }}
        onCancel={onCancel}
        width="800px"
        onOk={onOk}
        maskClosable={false}
        bodyStyle={{ padding: '24px 24px 24px 40px' }}
        footer={[
          <Button key="back" onClick={onCancel}>
            取消
          </Button>,
          recordUrl ? (
            <Button key="record" onClick={recordOpen}>
              导入记录
            </Button>
          ) : null,
          <Button key="submit" type="primary" loading={loading} onClick={onOk}>
            确定
          </Button>,
        ]}
      >
        <div className={styles['upload-box']}>
          <h3>
            一、请按照数据模板的格式准备要导入的数据。
            <span
              type="link"
              onClick={dt}
              style={{
                color: '#47acff',
                cursor: 'pointer',
                pointerEvents: loading ? 'none' : 'auto',
              }}
            >
              点击下载《{templateName}》
            </span>
          </h3>
          <p>导入文件请勿超过2MB（约10,000条数据）</p>
          <h3>二、请选择数据重复时的处理方式（查重规则：【{repeatStr}】）</h3>
          <p>查重规则为：添加客户时所需填写的所有唯一字段，当前设置唯一字段为：{repeatStr}</p>
          {noType ? null : (
            <Select
              style={{ width: '400px', marginBottom: '8px' }}
              onChange={val => setType(val)}
              allowClear={false}
              value={type}
            >
              <Option value="overwrite">覆盖原有系统数据</Option>
              <Option value="skip">跳过</Option>
            </Select>
          )}
          <h3>三、请选择需要导入的文件</h3>
          <div style={{ display: 'flex' }}>
            <Input
              readOnly
              value={file?.name}
              style={{ width: '400px' }}
              placeholder="请选择文件"
            />
            <Button style={{ position: 'relative', marginLeft: '8px' }} type="primary">
              上传文件
              <input
                type="file"
                style={{
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  opacity: 0,
                }}
                onChange={selectFile}
                value=""
              />
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        title="导入信息"
        visible={visibleShow}
        footer={null}
        width="80%"
        onCancel={onCancelShow}
        maskClosable={false}
      >
        {visibleShow &&
        (showData?.rows.length ? (
          <>
            {describe}
            <Divider dashed />
            <MyTable
              columns={columns}
              showSearch={false}
              rowKey={(item, index) => `${item.errorMessage}-${index}`}
              dataSource={showData.rows}
              height="600px"
            />
          </>
        ) : (
          <Result
            status="success"
            title="数据导入完成！"
            subTitle={describe}
            extra={[
              <Button
                type="primary"
                onClick={() => {
                  opOpen();
                  onCancelShow();
                }}
              >
                继续导入
              </Button>,
              <Button onClick={onCancelShow}>关闭</Button>,
            ]}
          />
        ))}
      </Modal>
      <Modal
        title="导入记录"
        visible={visibleRecord}
        footer={null}
        width="80%"
        onCancel={onCancelRecord}
        maskClosable={false}
      >
        {visibleRecord && (
          <MyTable
            // columns={columns}
            columns={[
              { title: '导入描述', dataIndex: 'remark', width: 500 },
              { title: '导入时间', dataIndex: 'createdDate', width: 180 },
              { title: '操作人', dataIndex: 'creatorName' },
            ]}
            showSearch={false}
            rowKey={(item, index) => `${item.errorMessage}-${index}`}
            store={{
              url: recordUrl,
              type: 'POST',
              autoLoad: true,
            }}
            height="600px"
          />
        )}
      </Modal>
    </>
  );
}
