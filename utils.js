import React, { useLayoutEffect, useState, useRef, useEffect, useCallback } from 'react';
import { stringify } from 'qs';
import moment from 'moment';
import { utils } from '@sei/suid';
import { Tag, Form } from 'antd';
import { useDeepCompareEffect } from 'ahooks';
import { getDvaApp } from 'umi';
import { request } from '@/utils';
import constants, { SEI_COMMONS_DATA } from '@/utils/constants';

const { eventBus } = utils;
const { SERVER_PATH } = constants;

// 获取全局的model
export const getGlobalData = name => getDvaApp()._store.getState()[name];

/**
 * @description: 所有表单组件【selectUserByOrz】的必选校验
 * SELECTUSERBYORZ_REQUIRED_RULE
 */
export const selectUserByOrzRequiredRule = (message = '请选择变更负责人') => ({
  required: true,
  message,
  validator({ message: msg, required }, value, callback) {
    if (Object.keys(value)?.length || !required) {
      callback();
    } else {
      callback(msg);
    }
  },
});

/**
 * @description: 统一时间格式的展示
 * @param {date} date 对应 时间日期
 *
 * @return: 返回处理好的时间格式
 *
 */
export const rowShowTime = (date, format = 'YYYY-MM-DD HH:mm:ss') =>
  date ? moment(date).format(format) : '';

/**
 * @description: 找到配置项中的对应value值
 * @param {{label: string, value: string | number | boolean}[]} options 数组
 * @param {string | number | boolean} val 对应 value
 *
 * @return: 返回对应对象的 lable
 *
 */
export const optionFindLable = (options, val) => {
  const obj = options.find(re => re.value === val);
  let show = obj?.label;
  if (show && obj?.color) {
    show = <Tag color={obj.color}>{show}</Tag>;
  }
  return show;
};

/**
 * @description: 搜索数据打包
 * @method searchDataPackaged
 * @param {Object} obj
 * @param {string} rangePickerMode 将type rangePicker 日期分开打包：list 合并打包: arr
 * @param {boolean} usePlace 是否处理 place 字段
 *
 * @return {Array[{ fieldName, operator, value}]}
 */
export const searchDataPackaged = ({
  obj,
  rangePickerMode,
  // usePlace,
  noTypeData,
  dateFormat = 'YYYY-MM-DD',
  fieldDate,
}) => {
  if (!obj) return [];
  const newObj = { ...obj };
  const keys = Object.keys(newObj);
  const arrFilter = [];
  keys.forEach(item => {
    const [operator, fieldName, type] = item.split('_');
    // if (type === 'list' && newObj[item]) {
    //   delete newObj[item];
    // }
    let fieldType = null;
    if (type === 'datePicker' && newObj[item]) {
      newObj[item] = moment(newObj[item]).format(dateFormat);
      fieldType = 'date';
    }
    if (type === 'selectMultiple' && newObj[item] && newObj[item].length === 0) {
      newObj[item] = undefined;
    }
    if (type === 'treeSelect' && newObj[item] && newObj[item].length === 0) {
      newObj[item] = undefined;
    }
    if (type === 'rangePicker' && rangePickerMode === 'arr' && newObj[item]) {
      if (noTypeData) {
        const arr = [];
        newObj[item].forEach(i => {
          arr.push(moment(i).format(dateFormat));
        });
        newObj[item] = arr;
        fieldType = null;
      } else {
        const arr = [];
        newObj[item].forEach(i => {
          arr.push(moment(i).format(dateFormat));
        });
        newObj[item] = arr;
        fieldType = fieldDate || (dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime');
      }
    } else if (type === 'rangePicker' && rangePickerMode === 'list' && newObj[item]) {
      if (newObj[item][0] || newObj[item][1]) {
        if (noTypeData) {
          arrFilter.push({
            fieldName,
            operator: 'GE',
            value: moment(newObj[item][0]).format(dateFormat),
            fieldType: null,
          });
          arrFilter.push({
            fieldName,
            operator: 'LE',
            value: moment(newObj[item][1]).format(dateFormat),
            fieldType: null,
          });
        } else {
          arrFilter.push({
            fieldName,
            operator: 'GE',
            value: moment(newObj[item][0]).format(dateFormat),
            fieldType: fieldDate || (dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime'),
          });
          arrFilter.push({
            fieldName,
            operator: 'LE',
            value: moment(newObj[item][1]).format(dateFormat),
            fieldType: fieldDate || (dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime'),
          });
        }
      }
      return;
    }
    // else if (type === 'place') {
    //   if (!usePlace) {
    //     return;
    //   }
    // }

    arrFilter.push({
      fieldName,
      operator,
      value: typeof newObj[item] === 'string' ? newObj[item].trim() : newObj[item],
      fieldType,
    });
  });
  return arrFilter.filter(item => !!item.value || item.value === false || item.value === 0);
};

/**
 * @description: 自定义hooks，获取元素的高度
 * @param {dom} ref 接收一个dom元素，实时计算它的高度
 *
 * @return {number} 返回元素高度
 * */
export const useClientHeight = (ref = {}) => {
  const [offsetHeight, setClientHeight] = useState(0);
  const h = ref?.offsetHeight

  useLayoutEffect(() => {
    if (ref && ref.offsetHeight) {
      setClientHeight(ref.offsetHeight);
    } else {
      setClientHeight(0);
    }
  }, [ref, h]);

  return offsetHeight;
};

/**
 * @description: 获取上一个状态
 * @param {any} value
 *
 * @return {any} 上一个状态
 */
export const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

/**
 * @description: 根据codes，获取字典数据并处理
 * @param {Array} codes 字典code数组
 * @param {Function} setDict 设置字典数据的函数
 * @param {Function} setLoading 设置loading的函数
 */
function reqDict({ codes, setDict, setLoading }) {
  setLoading(true);
  Promise.all(
    codes.map(code => {
      // 循环对每一个code发出请求
      return request({
        url: `${SERVER_PATH}/${SEI_COMMONS_DATA}/dataDict/getCanUseDataDictValues`,
        method: 'get',
        headers: { neverCancel: true },
        params: { dictCode: code },
      }).then(({ success, data }) => {
        if (success) {
          return {
            success,
            data,
            code,
          };
        }
        return { success };
      });
    }),
  )
    .then(res => {
      const newDict = res.reduce((pre, { success, data, code }) => {
        if (success) return { ...pre, [code]: data };
        return pre;
      }, {});
      setDict(dict => ({ ...dict, ...newDict }));
    })
    .finally(() => setLoading(false));
}

/**
 * @description: 自定义hooks，获取字典数据
 * @param {Array} codes 字典code数组
 *
 * @return {Object} {dict: 字典数据, load: 重新获取字典数据的函数, loading: 是否正在加载}
 */
export const useDict = (codes = []) => {
  const [dict, setDict] = useState({});
  const [loading, setLoading] = useState(false);
  const load = useCallback((cs = codes) => reqDict({ codes: cs, setDict, setLoading }), [codes]);

  useDeepCompareEffect(() => {
    reqDict({ codes, setDict, setLoading });
  }, [codes]);

  return { dict, load, loading };
};

/**
 * @description: 获取字典对应字段
 * @param {{dataName: string, dataValue: string | number | boolean}[]} options 数组
 * @param {string | number | boolean} val 对应 dataValue
 * @return: 返回对应对象的 lable
 *
 */
export const optionFindLableDict = (options = [], val) => {
  const obj = options.find(re => re.dataValue === val);
  const show = obj?.dataName || val;
  return show;
};

/**
 * @description: 统一时间格式
 * @param {Date} date 时间日期
 * @param {string} format 时间格式 默认："YYYY-MM-DD HH:mm:ss"
 */
export const timerFormat = (date, format = 'YYYY-MM-DD HH:mm:ss') =>
  date ? moment(date).format(format) : null;

/**
 * @description: 下载文件使用
 */
export const downloadBlobFile = (data, name) => {
  const blob = new Blob([data], { type: 'application/vnd.ms-excel,charset=utf-8' });
  const fileName = name;
  if ('download' in document.createElement('a')) {
    // 非IE下载
    const elink = document.createElement('a');
    elink.download = fileName;
    elink.style.display = 'none';
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href); // 释放URL 对象
    document.body.removeChild(elink);
  } else {
    // IE10+下载
    navigator.msSaveBlob(blob, fileName);
  }
};

/**
 * @description: 返回对相应的数据类型
 *
 * @param {*} data
 *
 * @return {string} 返回对应的数据类型
 */
export function getType(data) {
  return Object.prototype.toString
    .call(data)
    .substring(8)
    .split(/]/)[0];
}

/**
 * @param {*} sourceObj
 * @param {*} compareObj
 *
 * 比较对象是否相等
 */
export function comparisonObject(sourceObj, compareObj) {
  // eslint-disable-next-line no-throw-literal, @typescript-eslint/no-throw-literal
  if (arguments.length < 2) throw 'Incorrect number of parameters';
  const sourceType = getType(sourceObj);
  if (sourceType !== getType(compareObj)) return false;
  // Not objects and arrays
  if (
    sourceType !== 'Array' &&
    sourceType !== 'Object' &&
    sourceType !== 'Set' &&
    sourceType !== 'Map'
  ) {
    if (sourceType === 'Number' && sourceObj.toString() === 'NaN') {
      return compareObj.toString() === 'NaN';
    }
    if (sourceType === 'Date' || sourceType === 'RegExp') {
      return sourceObj.toString() === compareObj.toString();
    }
    return sourceObj === compareObj;
  }
  if (sourceType === 'Array') {
    if (sourceObj.length !== compareObj.length) return false;
    if (sourceObj.length === 0) return true;
    for (let i = 0; i < sourceObj.length; i += 1) {
      if (!comparisonObject(sourceObj[i], compareObj[i])) return false;
    }
  } else if (sourceType === 'Object') {
    const sourceKeyList = Reflect.ownKeys(sourceObj);
    const compareKeyList = Reflect.ownKeys(compareObj);
    let key;
    if (sourceKeyList.length !== compareKeyList.length) return false;
    for (let i = 0; i < sourceKeyList.length; i += 1) {
      key = sourceKeyList[i];
      if (key !== compareKeyList[i]) return false;
      if (!comparisonObject(sourceObj[key], compareObj[key])) return false;
    }
  } else if (sourceType === 'Set' || sourceType === 'Map') {
    // 把 Set Map 转为 Array
    if (!comparisonObject(Array.from(sourceObj), Array.from(compareObj))) return false;
  }
  return true;
}

/**
 * @description: 获取弹窗模式
 * @param {number} editType 模式 1:新增 2:编辑 3:查看
 *
 * @return: 返回对应的模式
 */
export function getModel(editType) {
  switch (editType) {
    case 3:
      return '查看';
    case 2:
      return '编辑';
    case 1:
      return '新增';
    default:
      return '-';
  }
}

export const FREEZE_OPTOONS = [
  { label: '冻结', value: true, color: 'red' },
  { label: '启用', value: false, color: 'green' },
];

/**
 * @description: 受控组件
 * @param {Object} WrappedComponent
 *
 * @param {Function} props.formState
 * @param {Function} props.setFormState
 * @param {Function} props.formStateFields
 * @param {Function} props.setFormStateFields
 * @return: Form 受控表单表单
 */
export const withFormControl = WrappedComponent => {
  return Form.create({
    onFieldsChange(props, changedFields) {
      const { setFormStateFields } = props;
      if (setFormStateFields) setFormStateFields(state => ({ ...state, ...changedFields }));
    },
    onValuesChange({ setFormState }, values) {
      if (setFormState) setFormState(state => ({ ...state, ...values }));
    },
    mapPropsToFields(props) {
      const { formState = {}, formStateFields = {} } = props;
      if (!formState) return {};
      const allKeys = [...new Set(Object.keys(formState).concat(Object.keys(formStateFields)))];
      return allKeys.reduce((pre, d) => {
        return {
          ...pre,
          [d]: Form.createFormField({
            ...(formStateFields?.[d] || {}),
            value: formState[d],
          }),
        };
      }, {});
    },
  })(WrappedComponent);
};

const MODE_ARR = ['day', 'hour', 'minute'];
const MODE_DIR = {
  day: { rang: 24, name: 'disabledHours', ex: 'hour' },
  hour: { rang: 60, name: 'disabledMinutes', ex: 'minute' },
  minute: { rang: 60, name: 'disabledSeconds', ex: 'second' },
  // second: { rang: 1000, name: "无", ex: '无', },
}; // 一天24小时，一小时60分钟，一分钟60秒。字典
/**
 * @description: 时间校验
 * @param {Moment} startValue 开始时间
 * @param {Moment} endValue 结束时间
 * @param {String} mode 那那种时间类型结束 day hour minute
 * @param {String} type 开始还是结束 start end
 *
 * @return: 返回对应的模式
 */
export const disabledTime = (startValue, endValue, mode = 'minute', type = 'start') => {
  if (!startValue || !endValue) return false;

  const obj = {
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  };

  for (const m of MODE_ARR) {
    const isSame = startValue.isSame(endValue, m);

    if (isSame) {
      if (type === 'start') {
        const dt = endValue[MODE_DIR[m].ex](); // m !== mode ? Math.min(endValue[MODE_DIR[m].ex]() + 1, MODE_DIR[m].rang) : endValue[MODE_DIR[m].ex]()
        obj[MODE_DIR[m].name] = () =>
          Array.from({ length: MODE_DIR[m].rang }, (_, i) => i).splice(dt, MODE_DIR[m].rang);
      } else {
        const dt = startValue[MODE_DIR[m].ex](); // m !== mode ? Math.min(startValue[MODE_DIR[m].ex]() + 1, MODE_DIR[m].rang) : startValue[MODE_DIR[m].ex]()
        obj[MODE_DIR[m].name] = () =>
          Array.from({ length: MODE_DIR[m].rang }, (_, i) => i).splice(0, dt);
      }
    } else {
      break;
    }

    if (m === mode) break;
  }

  return obj;
};

/**
 * @description: 日期校验
 * @param {Moment} startValue 开始日期
 * @param {Moment} endValue 结束日期
 * @param {String} type 开始还是结束 start end
 * @return: 返回对应的模式
 */
export const disabledDate = (startValue, endValue, type = 'start') => {
  if (!startValue || !endValue) return false;
  if (type === 'start') return startValue.valueOf() > endValue?.valueOf?.();
  return startValue.valueOf() <= endValue?.valueOf?.();
};

/**
 * 打开页签
 * @param params
 * @param title：打开标签页的名称
 * @param id：打开标签页的id
 * @param url：打开标签页的路由
 * @param localUrl：本地测试时打开的路由地址
 */
export const handleOpenTab = ({ params, title, id, url, localUrl }) => {
  if (window.top.__portal__?.eventBus) {
    eventBus.emit('openTab', {
      id,
      title,
      url: `${url}?${stringify(params)}`,
      activedRefresh: true,
      closeActiveParentTab: true,
    });
  } else {
    window.open(`${localUrl}?${stringify(params)}`);
  }
};

/**
 * 关闭页签
 * @param id：要关闭页签的id
 * * @param refresh：是否需要刷新
 */
export const handleCloseTab = (id, refresh) => {
  if (window.top.__portal__?.eventBus) {
    eventBus.emit('closeTab', [id]);
    // 如果需要刷新，则触发一个自定义事件通知刷新
    if (refresh) eventBus.emit('refreshOrderList', [id]);
  } else {
    window.close();
  }
};

// 验证是否是数字
export const validateNumber = value => !Number.isNaN(parseFloat(value)) && Number.isFinite(value);

// 常用的一些正则表达式
/**
 *  @description: 座机号码验证
 */
export const REGEXP_LANDLINE = /(?:(\\(\\+?86\\))(0[0-9]{2,3}-?)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?)|(?:(86-?)?(0[0-9]{2,3}-?)?([2-9][0-9]{6,7})+(\\-[0-9]{1,4})?)/;

/**
 *  @description: 手机号码验证
 */
export const REGEXP_PHONE = /^[1][2,3,4,5,6,7,8,9][0-9]{9}$/;

/**
 *  @description: 邮箱号验证
 */
export const REGEXP_EMAIL = /[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/;
