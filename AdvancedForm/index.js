import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Drawer } from 'antd';
import { ExtIcon } from '@sei/suid';
import classnames from 'classnames';
import FormBox from '../FormBox';
import styles from './index.less';
// import { ICON_FILTER } from '@/utils/constants';

const AdvancedForm = forwardRef(
  (
    {
      formItems = [],
      outFormItems = [],
      onOk = () => null,
      formBoxProps = {},
      outFormBoxProps = {},
      advBtnProps = {},
      extra = '过滤',
      nofooter,
      drawerWidth = 500,
      formSpan = 24,
      outSearchBtn = false,
      outBtnStayle = {},
      describe = '', // 底部文字描述
    },
    ref,
  ) => {
    let refForm = null;
    let refFormOut = null;
    const [visible, triggerVisible] = useState(false);
    const hide = () => triggerVisible(false);
    const haveFormItem = !!formItems.length;

    useEffect(() => {
      document.addEventListener('keydown', tabOpenSearch)
      return () => document.removeEventListener('keydown', tabOpenSearch)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      if (visible) {
        document.addEventListener('keydown', handleSearch, true)
      } else {
        document.removeEventListener('keydown', handleSearch, true)
      }
      return () => document.removeEventListener('keydown', handleSearch, true)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    useImperativeHandle(ref, () => {
      return {
        form: refForm?.form,
        formOut: refFormOut?.form,
        handleReset,
        handleSubmit,
        hide,
      };
    });

    function tabOpenSearch(e) {
      // Tab 打开搜索
      if (e.keyCode === 70 && e.ctrlKey && haveFormItem) {
        triggerVisible(visible => !visible)
        e.stopPropagation()
      }
    }

    function handleSearch(e) {
      // 回车搜索
      if (e.keyCode === 13) {
        handleSubmit()
        e.stopImmediatePropagation()
      }
    }

    // 调用触发搜索回掉
    function handleSubmit(...vals) {
      const Form = refForm?.form;
      const Formout = refFormOut?.form;
      const outVal = Formout?.getFieldsValue();
      if (outVal?.value_search) outVal.value_search = outVal.value_search.trim();
      onOk(Form?.getFieldsValue(), outVal, ...vals);
      hide();
    }

    function handleReset() {
      const Form = refForm.form;
      Form &&
        Form.multipleSelect &&
        Form.multipleSelect.forEach(res => {
          res([]);
        });
      Form && Form.resetFields();
    }

    function handleResetOut() {
      const Form = refFormOut.form;
      Form &&
        Form.multipleSelect &&
        Form.multipleSelect.forEach(res => {
          res([]);
        });
      Form && Form.resetFields();
    }

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', ...outBtnStayle }}>
          {/* 弹出搜索框-star */}
          <Drawer
            title="高级查询"
            width={drawerWidth}
            onClose={hide}
            visible={visible}
            bodyStyle={{ paddingBottom: 80 }}
          // onKeyUp={(e) => {
          //   if (e.keyCode === 13) {
          //     handleSubmit()
          //   }
          // }}
          >
            <div>
              <FormBox
                // ref={refForm}
                span={formSpan}
                wrappedComponentRef={form => (refForm = form)}
                styleItem={{ marginBottom: '8px' }}
                // noBottomMargin={true}
                formItems={formItems}
                FormItemProps={{ labelCol: { span: 6 }, wrapperCol: { span: 18 } }}
                // rowProps={{ gutter: [0, 8] }}
                {...formBoxProps}
              />
              <div className={styles.description}>{describe}</div>
              <div className={[nofooter ? classnames([styles.hide]) : styles.btnWrapper]}>
                <Button onClick={handleReset} className={styles.btns}>
                  重置
                </Button>
                <Button type="primary" onClick={handleSubmit} className={styles.btns}>
                  搜索
                </Button>
              </div>
            </div>
          </Drawer>
          {/* 弹出搜索框-end */}
          {outFormItems.length ? (
            <FormBox
              wrappedComponentRef={form => (refFormOut = form)}
              // outLineHeight={true}
              formItems={outFormItems}
              // FormItemProps={{ wrapperCol: { span: 24 }, labelCol: { span: 0 } }}
              styleItem={{ marginBottom: '0', marginRight: '8px' }}
              styleBox={{ width: '400px' }}
              span={12}
              {...outFormBoxProps}
            />
          ) : (
            ''
          )}
          {haveFormItem ? (
            <Button onClick={() => triggerVisible(!visible)} {...advBtnProps}>
              {/* <Icon type="filter" /> */}
              <ExtIcon
                type="filter"
                style={{ marginRight: '2px', fontSize: '18px', verticalAlign: 'middle' }}
              />
              {extra}
            </Button>
          ) : (
            ''
          )}
          {outSearchBtn && (
            <>
              <Button onClick={handleResetOut} className={styles.btns}>
                重置
              </Button>
              <Button type="primary" onClick={handleSubmit} className={styles.btns}>
                搜索
              </Button>
            </>
          )}
        </div>
      </>
    );
  },
);

export default AdvancedForm;
