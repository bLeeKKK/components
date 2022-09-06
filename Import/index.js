import React, { useState } from 'react';
import PerBtn from '@/components/PerBtn';
import { Button, Modal, Input, message, Select, Result, Divider, Tag } from 'antd';
import styles from './index.less';
import { downloadBlobFile } from '../utils';
import { ExtTable } from '@sei/suid'

const { Option } = Select;

/**
 * @param {string} pKey 权限控制key
*/
export default function Import({
  pKey,
  downloadTemplate,
  importData,
  repeatStr,
  templateName = "name",
  showColumns = []
}) {

  const [file, setFile] = useState();
  const [visible, setVisible] = useState(false); // 上传弹窗
  const [visibleShow, setVisibleShow] = useState(false); // 展示弹窗
  const [showData, setShowData] = useState(); // 展示用数据
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('overwrite');

  function opOpen() {
    setVisible(true);
  }

  function selectFile(e) {
    setFile(e.target.files[0])
  }

  function dt() {
    setLoading(true)
    downloadTemplate()
      .then((res) => {
        const { success, data, message: msg, headers } = res;
        if (success) {
          downloadBlobFile(data, decodeURI(headers['content-disposition'].split("''")[1]));
        } else {
          message.error(msg);
        }
      })
      .finally(() => setLoading(false))
  }

  function onOk() {
    importData({ type, file, })
      .then(({ success, message: msg, data }) => {
        if (success) {
          message.success(msg);
          onCancel();
          setVisibleShow(true);
          setShowData(data)
        } else {
          message.error(msg);
        }
      })
  }

  function onCancel() {
    setVisible(false);
    setFile(undefined)
  }

  function onCancelShow() {
    setVisibleShow(false);
    setShowData(undefined);
  }

  const describe = <span>
    导入总数数据{showData?.count}条，覆盖{showData?.overwriteCount}条，跳过{showData?.skipCount}条，导入成功{showData?.successCount}条，导入失败<span style={{ color: "red" }}>{showData?.failCount}</span>条（成功数包含了覆盖数）
  </span>


  return (
    <>
      <PerBtn pKey={pKey} onClick={opOpen}>导入</PerBtn>
      <Modal
        title={`线索导入`}
        visible={visible}
        okText={"导入"}
        okButtonProps={{ loading }}
        cancelText={"取消"}
        onCancel={onCancel}
        width={"800px"}
        onOk={onOk}
        maskClosable={false}
        bodyStyle={{ padding: "24px 24px 24px 40px" }}
      >
        <div className={styles['upload-box']}>
          <h3>
            一、请按照数据模板的格式准备要导入的数据。
            <span type='link' onClick={dt} style={{ color: "#47acff", cursor: "pointer", "pointerEvents": loading ? "none" : "auto" }}>
              点击下载《{templateName}》
            </span>
          </h3>
          <p>导入文件请勿超过2MB（约10,000条数据）</p>
          <h3>二、请选择数据重复时的处理方式（查重规则：【{repeatStr}】）</h3>
          <p>查重规则为：添加客户时所需填写的所有唯一字段，当前设置唯一字段为：{repeatStr}</p>
          <Select
            style={{ width: "400px", marginBottom: "8px" }}
            onChange={(val) => setType(val)}
            allowClear={false}
            value={type}
          >
            <Option value="overwrite">覆盖原有系统数据</Option>
            <Option value="skip">跳过</Option>
          </Select>
          <h3>三、请选择需要导入的文件</h3>
          <div style={{ display: "flex" }}>
            <Input readOnly value={file?.name} style={{ width: "400px" }} />
            <Button style={{ position: "relative", marginLeft: "8px" }} type="primary" >
              上传文件
              <input
                type={'file'}
                style={{ left: 0, top: 0, width: "100%", height: "100%", position: "absolute", opacity: 0 }}
                onChange={selectFile}
                value={''}
              />
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        title={`导入信息`}
        visible={visibleShow}
        footer={null}
        width={"80%"}
        onCancel={onCancelShow}
        maskClosable={false}
      >
        {
          showData?.rows.length
            ? <>
              {describe}
              <Divider dashed />
              <ExtTable
                columns={[
                  {
                    title: '校验状态',
                    dataIndex: 'id',
                    render: (t) => t ? <Tag color="green">成功</Tag> : <Tag color="magenta">失败</Tag>
                  },
                  { title: '错误信息', dataIndex: 'errorMessage', width: 300 },
                  ...showColumns,
                ]}
                showSearch={false}
                rowKey={(item, index) => `${item.errorMessage}-${index}`}
                dataSource={showData.rows}
                height="600px"
              />
            </>
            : <Result
              status="success"
              title="数据导入完成！"
              subTitle={describe}
              extra={[
                <Button
                  type="primary"
                  onClick={() => {
                    opOpen()
                    onCancelShow()
                  }}
                >
                  继续导入
                </Button>,
                <Button onClick={onCancelShow}>关闭</Button>,
              ]}
            />
        }
      </Modal>
    </>
  )
}
