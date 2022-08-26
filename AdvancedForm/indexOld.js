import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Icon } from 'antd';
import FormBox from '../FormBox';
import classnames from 'classnames';
import styles from './index.less';
import moment from 'moment';

const AdvancedForm = forwardRef(
  (
    {
      formItems = [],
      outFormItems = [],
      onOk = () => null,
      formBoxProps = {},
      outFormBoxProps = {},
      advBtnProps = {},
      extra = '高级查询',
      nofooter,
    },
    ref,
  ) => {
    let refForm = null;
    let refFormOut = null;
    const [visible, triggerVisible] = useState(false);
    const hide = () => triggerVisible(false);

    useImperativeHandle(ref, () => {
      return {
        form: refForm?.form,
        formOut: refFormOut?.form,
        handleReset,
        handleSubmit,
        hide,
      };
    });

    function handleSubmit(...vals) {
      hide();
      const Form = refForm?.form;
      const Formout = refFormOut?.form;
      console.log(refFormOut, refForm);
      onOk(Form?.getFieldsValue(), Formout?.getFieldsValue(), ...vals);
    }

    function handleReset() {
      const Form = refForm.form;
      Form && Form.resetFields();
    }

    return (
      <>
        {/* 弹出搜索框-star */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={classnames([styles['adv-box'], 'advanced-form-in'])}>
            <div
              className={classnames({
                [styles.modal]: true,
                [styles.show]: visible,
                [styles.hide]: !visible,
              })}
            >
              <Icon type="close" className={styles.close} onClick={hide} />
              <div className={styles.content}>
                <FormBox
                  // ref={refForm}
                  wrappedComponentRef={form => (refForm = form)}
                  styleItem={{ marginBottom: '8px' }}
                  formItems={formItems}
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
            </div>
          </div>
          {/* 弹出搜索框-end */}
          {outFormItems.length ? (
            <FormBox
              wrappedComponentRef={form => (refFormOut = form)}
              outLineHeight={true}
              formItems={outFormItems}
              FormItemProps={{ wrapperCol: { span: 24 }, labelCol: { span: 0 } }}
              styleItem={{ marginBottom: '0', marginRight: '8px' }}
              styleBox={{ width: '400px' }}
              span={12}
              {...outFormBoxProps}
            />
          ) : (
            ''
          )}
          {formItems.length ? (
            <Button
              icon={visible ? 'up' : 'down'}
              onClick={() => triggerVisible(!visible)}
              {...advBtnProps}
            >
              {extra}
            </Button>
          ) : (
            ''
          )}
        </div>
      </>
    );
  },
);

/** searchDataPackaged 方法说明
 * @method searchDataPackaged
 * @param {Object} obj
 * @return {Array[{ fieldName, operator, value}]}
 */
export const searchDataPackaged = (
  obj,
  ifDeleted,
  rangePicker_type,
  usePlace,
  noTypeData,
  dateFormat = 'YYYY-MM-DD',
  fieldDate,
) => {
  if (ifDeleted) {
    obj.Q_EQ_ifDeleted = '0';
  }
  // if(rangePicker_type == 'rangePicker_type_list' && obj.Q_BT_createdDate_rangePicker) {
  //   obj.Q_GE_createdDate_rangePicker=moment(obj.Q_BT_createdDate_rangePicker[0]).format('YYYY-MM-DD');
  //   obj.Q_LE_createdDate_rangePicker=moment(obj.Q_BT_createdDate_rangePicker[1]).format('YYYY-MM-DD');
  //   delete obj.Q_BT_createdDate_rangePicker
  // }
  const keys = Object.keys(obj);
  const arrFilter = [];
  keys.forEach(item => {
    const [_, operator, fieldName, type] = item.split('_');
    if (type === 'list' && obj[item]) {
      delete obj[item];
    }
    let fieldType = null;
    if (type === 'datePicker' && obj[item]) {
      obj[item] = moment(obj[item]).format(dateFormat);
      fieldType = 'date';
    }
    if (type === 'selectMultiple' && obj[item] && obj[item].length === 0) {
      obj[item] = undefined;
    }
    if (type === 'rangePicker' && rangePicker_type == 'rangePicker_type_arr' && obj[item]) {
      if (noTypeData) {
        const arr = [];
        obj[item].map((i, index) => {
          arr.push(moment(i).format(dateFormat));
        });
        obj[item] = arr;
        fieldType = null;
      } else {
        const arr = [];
        obj[item].map((i, index) => {
          arr.push(moment(i).format(dateFormat));
        });
        obj[item] = arr;
        fieldType = fieldDate || (dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime');
      }
    } else if (type === 'rangePicker' && rangePicker_type == 'rangePicker_type_list' && obj[item]) {
      if (obj[item][0] || obj[item][1]) {
        if (noTypeData) {
          arrFilter.push({
            fieldName,
            operator: 'GE',
            value: moment(obj[item][0]).format(dateFormat),
            fieldType: null,
          });
          arrFilter.push({
            fieldName,
            operator: 'LE',
            value: moment(obj[item][1]).format(dateFormat),
            fieldType: null,
          });
        } else {
          arrFilter.push({
            fieldName,
            operator: 'GE',
            value: moment(obj[item][0]).format(dateFormat),
            fieldType: fieldDate || (dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime'),
          });
          arrFilter.push({
            fieldName,
            operator: 'LE',
            value: moment(obj[item][1]).format(dateFormat),
            fieldType: fieldDate || (dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime'),
          });
        }
      }
      return;
    } else if (type === 'place') {
      if (!usePlace) {
        return;
      }
    }

    arrFilter.push({
      fieldName,
      operator,
      value: typeof obj[item] === 'string' ? obj[item].trim() : obj[item],
      fieldType,
    });
  });
  return arrFilter.filter(item => !!item.value || item.value === false);
};
export function searchDataSmple(data) {
  let obj = {};
  for (let keyType in data) {
    let [key, type] = keyType.split('_');
    if (type === 'datePicker' && data[keyType]) {
      data[keyType] = moment(data[keyType]).format('YYYY-MM-DD HH:mm:ss');
    }
    if (type === 'tableRadio' && data[keyType] && data[keyType][0]) {
      data[keyType] = data[keyType][0];
    }

    obj[key] = data[keyType];
  }
  return obj;
}

export default AdvancedForm;
