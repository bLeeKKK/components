import React, { forwardRef, useImperativeHandle } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Tooltip,
  Checkbox,
  Radio,
  Switch,
} from 'antd';
import momentFn from 'moment';
import { ComboGrid, ComboList, ComboTree, MoneyInput } from '@sei/suid';
import { MySelect, MyTreeSelect } from './myInputs';
import Place from './Place';
import SelectUserByOrz from './SelectUserByOrz';

const { RangePicker, MonthPicker } = DatePicker;
const { TextArea, Search } = Input;
const CheckboxGroup = Checkbox.Group;
export const Combos = {
  // suid
  grid: ComboGrid, // 表格选择
  list: ComboList, // 选择框
  tree: ComboTree, // 树状选择
  moneyInput: MoneyInput, // 钱 输入

  // antd
  datePicker: DatePicker, // 时间选择
  rangePicker: RangePicker, // 时间段选择
  monthPicker: MonthPicker, // 月份时间选择
  textarea: TextArea, // 文字输入区域
  number: InputNumber, // 数字输入
  checkboxGroup: CheckboxGroup, // 多选
  checkbox: Checkbox, // 复选框
  radioGroup: Radio.Group, // 单选
  radio: Radio, // 单选框
  switch: Switch, // 单选框
  search: React.forwardRef((props, ref) => (
    <Tooltip placement="bottom" title={props.placeholder}>
      <Search {...props} ref={ref} />
    </Tooltip>
  )), // 文字输入区域（快速搜索）

  // 自定义
  select: MySelect, // 单选
  // selectMultiple: MixinSelectMultiple, // 多选
  treeSelect: MyTreeSelect, // 树状选中
  // // tableRadio: MixinTable, // (props) => <MixinTable mode="radio" {...props} />, // 表格选择
  // tableCheck: MixinTable, // (props) => <MixinTable mode="checkbox" {...props} />, // 表格选择
  // // table: MixinTable,
  // rangePickerMonth: RangePickerMonth,
  place: Place, // 地址选择
  selectUserByOrz: SelectUserByOrz, // 地址选择
};

// 获取多层对象的值
const getValue = (obj, key) => {
  const keys = key.split('.');
  let value = obj;
  const len = keys.length;
  for (let i = 0; i < len; i += 1) {
    if (Object.prototype.toString.call(value) === '[object Object]') {
      value = value[keys[i]];
    } else {
      return value;
    }
  }
  return value;
};

const FormBox = forwardRef(
  (
    {
      form = {},
      formItems = [],
      span = 8,
      styleItem = {},
      styleBox = {},
      FormItemProps = {},
      outLineHeight = false,
      showErr = false,
      noBorder = false,
      noBottomMargin = false,
      rowProps = {},
      showObj = {},
      justShow = false,
      formLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
    },
    ref,
  ) => {
    const { getFieldDecorator } = form;
    useImperativeHandle(ref, () => ({ form }));
    const renderFormItem = item => {
      if (item.type === 'show' || justShow) {
        // 显示
        const strOrigin = showObj && getValue(showObj, item.key);
        let str = strOrigin;
        if (str === undefined || str === null || str === '') {
          str = '-';
        }
        if (item.render) {
          str = item.render(strOrigin, showObj, form) || '-';
        }
        return (
          <div
            key={item.key}
            style={{
              lineHeight: '40px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            title={str}
          >
            {str}
          </div>
        );
      }
      const Item = Combos[item.type] || Input;
      const { initialValue, ...otherProps } = item?.props || {};
      if (item.type === 'span') {
        return getFieldDecorator(`${item.key}_${item.type}`, {
          initialValue,
        })(<span>{initialValue}</span>);
      }

      if (item.type) {
        // 如果存在组件类型type，则直接返回
        return getFieldDecorator(`${item.key}_${item.type}`, {
          rules: item.rules || [],
          initialValue,
          ...(item.configItem || {}),
        })(
          <Item
            allowClear
            form={form}
            name={`${item.key}_${item.type}`}
            style={{ width: '100%', ...(item.style || {}) }}
            field={[`${item.field ? `${item.field}_${item.type}` : item.key}`]}
            {...item.props}
          />,
        );
      }

      // 不存在type类型返回，普通的input框
      return getFieldDecorator(`${item.key}`, {
        rules: item.rules || [],
        initialValue,
        ...(item.configItem || {}),
      })(
        <Input
          form={form}
          style={{ width: '100%', ...(item.style || {}) }}
          name={`${item.key}_${item.type}`}
          // field={[item.key]}
          {...otherProps}
        />,
      );
    };

    return (
      <div style={styleBox} className="my-form-box">
        <Row {...(rowProps || {})}>
          {formItems.map((item, index) => {
            // afterSelect代理
            let afterSelect = () => {};
            if (item?.props?.afterSelect) {
              afterSelect = item.props.afterSelect;
            }
            function afterSelectProxy(...parameter) {
              afterSelect.bind(form)(...parameter);
            }
            if (item.props && item.props.afterSelect) {
              // eslint-disable-next-line no-param-reassign
              item.props.afterSelect = afterSelectProxy;
            }
            // afterSelect代理

            // afterClear代理
            let afterClear = () => {};
            if (item?.props?.afterClear) {
              afterClear = item.props.afterClear;
            }
            function afterClearProxy(...parameter) {
              afterClear.bind(form)(...parameter);
            }
            if (item.props && item.props.afterClear) {
              // eslint-disable-next-line no-param-reassign
              item.props.afterClear = afterClearProxy;
            }
            // afterClear 代理

            return [
              <Col
                // eslint-disable-next-line react/no-array-index-key
                key={`${item.key}-${index}`}
                span={item.span || span}
                style={item.hide ? { display: 'none' } : { ...(item.styleCol || {}) }}
                {...(item.propCol || {})}
              >
                <Form.Item
                  className={`${outLineHeight ? 'out-line-height' : ''} ${
                    showErr ? 'show-err-box' : ''
                  } ${noBorder ? 'no-border' : ''} ${noBottomMargin ? 'no-bottom-margin' : ''}`}
                  label={item.title}
                  {...(item.formLayouts ? item.formLayouts : formLayout)}
                  {...FormItemProps}
                  style={styleItem}
                >
                  {renderFormItem(item)}
                </Form.Item>
              </Col>,
              item.extra ? (
                <Col
                  // eslint-disable-next-line react/no-array-index-key
                  key={`extra-${index}`}
                  span={item.extra?.span || item.span || span}
                  style={item.hide ? { display: 'none' } : { ...(item.styleCol || {}) }}
                  {...(item.propCol || {})}
                >
                  {item.extra.render(form, item)}
                </Col>
              ) : null,
            ];
          })}
        </Row>
      </div>
    );
  },
);

const timerFormat = 'YYYY-MM-DD HH:mm:ss';
export const packageData = ({ vals, types = {}, dateType }) => {
  const keys = Object.keys(vals);
  const objSend = {};
  keys.forEach(item => {
    const [fieldName, type] = item.split('_');
    if (types[fieldName] === 'num') {
      // eslint-disable-next-line no-param-reassign
      vals[item] = Number(vals[item]);
    } else if (types[fieldName] === 'str') {
      // eslint-disable-next-line no-param-reassign
      vals[item] = String(vals[item]);
    }
    if (type === 'datePicker' && vals[item]) {
      // eslint-disable-next-line no-param-reassign
      vals[item] = momentFn(vals[item]).format(dateType?.[fieldName] || timerFormat);
    } else if (type === 'tableRadio' && vals[item]) {
      // console.log(vals[item])
      // eslint-disable-next-line no-param-reassign
      vals[item] = vals[item] && vals[item][0];
    }
    if (vals[item] === 0 || vals[item] === false) {
      Object.assign(objSend, {
        [fieldName]: vals[item],
      });
    } else {
      Object.assign(objSend, {
        [fieldName]: vals[item], //  || ''
      });
    }
  });
  return objSend;
};

export const packageDataIn = ({ items = [], show = {} }) => {
  const obj = {};
  items.forEach(res => {
    if (show[res.key] !== undefined && show[res.key] !== null) {
      if (res.type === 'tableRadio') {
        obj[`${res.key}${res.type ? `_${res.type}` : ''}`] = [show[res.key]];
        return;
      }
      if (res.type === 'datePicker') {
        obj[`${res.key}${res.type ? `_${res.type}` : ''}`] = momentFn(show[res.key]);
        return;
      }
      if (res.type === 'selectMultiple') {
        // 请单独使用 Form 表单上的 multipleSelect 数组中的方法赋值
        return;
      }
      obj[`${res.key}${res.type ? `_${res.type}` : ''}`] = show[res.key];
    }
  });
  return obj;
};

/**
 * @description: 打包表单数据（受控组件使用）
 * @param {Object} obj 需要打包的对象
 *
 * */
export const mapPropsDataTransform = (obj, flag = 'field') => {
  if (!obj) return {};

  if (flag === 'field') {
    return Object.keys(obj).reduce((pre, d) => {
      const o = obj?.[d];
      if (typeof o !== 'object' || o === null) return pre;

      if (o.name) {
        return {
          ...pre,
          [o.name]: Form.createFormField({ ...o }),
        };
      }
      return {
        ...(mapPropsDataTransform(o, 'field') || {}),
      };
    }, {});
  }

  // 处理 flag 是 ‘value’ 的情况
  // 存在 xxx.xxx 的情况这里需要修改逻辑处理
  return Object.keys(obj).reduce((pre, d) => {
    return {
      ...pre,
      [d]: Form.createFormField({ value: obj[d] }),
    };
  }, {});
};

/**
 * 表单包裹组件
 * 可以出入自定义 Form 表单
 */
const FormCom = Form.create({
  onFieldsChange(props, changedFields) {
    if (props.onFieldsChange) props.onFieldsChange(changedFields, props);
  },
  onValuesChange(props, changedFields) {
    if (props.onValuesChange) props.onValuesChange(changedFields, props);
  },
})(FormBox);

function WForm({ form, ...props }) {
  if (form) {
    return <FormBox form={form} {...props} />;
  }
  return <FormCom {...props} />;
}

export default WForm;
