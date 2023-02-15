import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Drawer, Badge } from 'antd';
import { ExtIcon } from '@sei/suid';
import classnames from 'classnames';
import FormBox from '../FormBox';
import styles from './index.less';
// import { ICON_FILTER } from '@/utils/constants';

const AdvancedForm = forwardRef(
  (
    {
      form,
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
      separate = true, // 外部和内部 分离查询
      verification = false, // 是否验证
    },
    ref,
  ) => {
    let refForm = form;
    let refFormOut = null;

    const [visible, triggerVisible] = useState(false);
    const hide = () => triggerVisible(false);
    const haveFormItem = !!formItems.length;
    const requireFormItem = verification
      ? !!formItems.some(item => item.rules.some(ite => ite.required))
      : false;

    /**
     * @description: 调用触发搜索回掉
     * @param {boolean} separateTimer 执行时确定是否分开处理查询
     */
    const handleSubmit = async ({ separateTimer = false, ...vals } = {}) => {
      try {
        const Form = refForm;
        const Formout = refFormOut;
        const outVal = Formout?.getFieldsValue();
        const inVal = Form?.getFieldsValue();

        await new Promise((resolve, reject) => {
          if (verification) {
            if (Form) {
              Form.validateFields(err => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
            if (Formout) {
              Formout.validateFields(err => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
          } else {
            resolve();
          }
        });

        if (outVal?.value_search) outVal.value_search = outVal.value_search.trim();
        if (separateTimer || separate) {
          onOk(visible ? inVal : {}, visible ? {} : outVal, { ...vals });
        } else {
          onOk(inVal, outVal, { ...vals });
        }
        hide();
      } catch (e) {
        console.log(e);
      }
    };

    const handleReset = () => {
      const Form = refForm;
      if (Form) Form.resetFields();
    };

    const handleResetOut = () => {
      const Form = refFormOut;
      if (Form) Form.resetFields();
    };

    useEffect(() => {
      document.addEventListener('keydown', tabOpenSearch);
      return () => document.removeEventListener('keydown', tabOpenSearch);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (visible) {
        document.addEventListener('keydown', handleSearch, true);
      } else {
        document.removeEventListener('keydown', handleSearch, true);
      }
      return () => document.removeEventListener('keydown', handleSearch, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useImperativeHandle(ref, () => {
      return {
        form: refForm,
        formOut: refFormOut,
        handleReset,
        handleResetOut,
        handleSubmit,
        hide,
      };
    });

    function tabOpenSearch(e) {
      // Tab 打开搜索
      if (e.keyCode === 70 && e.ctrlKey && haveFormItem) {
        triggerVisible(vis => !vis);
        e.stopPropagation();
      }
    }

    function handleSearch(e) {
      // 回车搜索
      if (e.keyCode === 13) {
        handleSubmit();
        e.stopImmediatePropagation();
      }
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
          >
            <div>
              <FormBox
                // ref={refForm}
                form={form}
                span={formSpan}
                wrappedComponentRef={f => (refForm = form || f?.form)}
                styleItem={{ marginBottom: '8px' }}
                // noBottomMargin={true}
                formItems={formItems}
                FormItemProps={{ labelCol: { span: 6 }, wrapperCol: { span: 18 } }}
                // rowProps={{ gutter: [0, 8] }}
                {...formBoxProps}
              />
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
              wrappedComponentRef={f => (refFormOut = f?.form)}
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
            <Badge dot={requireFormItem}>
              <Button onClick={() => triggerVisible(!visible)} {...advBtnProps}>
                {/* <Icon type="filter" /> */}
                <ExtIcon
                  type="filter"
                  style={{ marginRight: '2px', fontSize: '18px', verticalAlign: 'middle' }}
                />
                {extra}
              </Button>
            </Badge>
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
