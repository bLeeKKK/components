import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import styles from './index.less';
import { useClientHeight } from '../utils';

/**
 * 全屏模态框
 * @param {Function} onCancel 自定义取消按钮的回调事件
 * @param {Function} onOk 自定义取消按钮的回调事件
 * @param {Object} okButtonProps 保存按钮属性
 * @param {Object} cancelButtonProps 取消按钮属性
 * @param {ReactDOM} title 禁止使用Modal 的 title
 * @param {ReactDOM} titleStr 标题
 * @param {ReactDOM} titleDescribe 标题下描述
 * @param {ReactDOM} topBtns 自定义按钮
 * @param {ReactDOM} children
 * @param {Object} props 收集：自定义弹窗属性
 * @return {ReactDOM}
 * 
 * @example:
*/
const FullModal = ({
  children,
  onCancel,
  onOk,
  okButtonProps = {},
  cancelButtonProps = {},
  title,
  titleStr,
  titleDescribe,
  topBtns,
  header = true,
  ...props
}) => {

  const [titleRef, setTitleRef] = useState();
  const offsetHeight = useClientHeight(titleRef);

  return (
    <>
      <Modal
        width={'100%'}
        closable={false}
        footer={null}
        style={{ top: 0, padding: 0, position: 'relative' }}
        bodyStyle={{ height: `100vh`, boxSizing: 'border-box', padding: '0px', overflow: 'auto' }}
        onCancel={onCancel}
        {...props}
      >
        <div ref={ref => setTitleRef(ref)}>
          {
            header && <div className={styles['title-box']}>
              <div className={styles['title-str-box']}>
                <div className={styles['title-str']}>{titleStr}</div>
                <div className={styles['title-describe']}>{titleDescribe}</div>
              </div>
              <div>
                {
                  topBtns
                    ? topBtns
                    : <>
                      <Button style={{ marginRight: "8px" }} onClick={onCancel} {...cancelButtonProps}>关闭</Button>,
                      <Button type='primary' onClick={onOk} {...okButtonProps}>保存</Button>
                    </>
                }
              </div>
            </div>
          }
        </div>
        {/* <div style={{ height: `${offsetHeight}px` }}></div> */}
        <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          {children}
        </div>
      </Modal>
    </>
  );
};

export default FullModal;
