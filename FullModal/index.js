import React from 'react';
import { Modal } from 'antd';

/**
 * 全屏模态框
 * @param {ReactDOM} children
 * @param {Object} props 收集：自定义弹窗属性
 * @return {ReactDOM}
 * 
 * @example:
 * <FullModal
    visible={visible}
    maskClosable={false}
    okButtonProps={{ loading }}
    onCancel={onCancel}
    onOk={onOk}
 * >
 *  <div>
 *    Some content
 *  </div>
 * </FullModal>
*/
const FullModal = ({
  children,
  ...props
}) => {

  return (
    <>
      <Modal
        width={'100%'}
        style={{ top: 0, padding: 0, position: 'relative' }}
        bodyStyle={{ height: 'calc(100vh - 53px)', boxSizing: 'border-box', padding: '0px', overflow: 'auto' }}
        {...props}
      >
        {children}
      </Modal>
    </>
  );
};

export default FullModal;
