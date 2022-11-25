import React, { useLayoutEffect, useState, useRef, useEffect } from 'react'
import moment from 'moment';
import { Tag } from 'antd';

/**
 * @description: 所有表单组件【selectUserByOrz】的必选校验
 * SELECTUSERBYORZ_REQUIRED_RULE
*/
export const selectUserByOrzRequiredRule = (message = '请选择变更负责人') => ({
  required: true,
  message,
  validator({ message: msg, required }, value, callback) {
    if (Object.keys(value)?.length || !required) {
      callback()
    } else {
      callback(msg)
    }
  }
})

/**
 * @description: 统一时间格式的展示
 * @param {date} date 对应 时间日期
 * @return: 返回处理好的时间格式
 * 
*/
export const rowShowTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => date ? moment(date).format(format) : '';

/**
 * @description: 找到配置项中的对应value值
 * @param {{label: string, value: string | number | boolean}[]} options 数组
 * @param {string | number | boolean} val 对应 value
 * @return: 返回对应对象的 lable
 * 
*/
export const optionFindLable = (options, val) => {
  const obj = options.find(re => re.value === val);
  let show = obj?.label
  if (show && obj?.color) {
    show = <Tag color={obj.color}>{show}</Tag>
  }
  return show
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
  if (!obj) return []
  const newObj = { ...obj }
  const keys = Object.keys(newObj);
  const arrFilter = [];
  keys.forEach(item => {
    const [operator, fieldName, type] = item.split('_');
    if (type === 'list' && newObj[item]) {
      delete newObj[item];
    }
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
        newObj[item].forEach((i) => {
          arr.push(moment(i).format(dateFormat));
        });
        newObj[item] = arr;
        fieldType = null;
      } else {
        const arr = [];
        newObj[item].forEach((i) => {
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

  useLayoutEffect(() => {
    if (ref && ref.offsetHeight) {
      setClientHeight(ref.offsetHeight);
    } else {
      setClientHeight(0)
    }
  }, [ref, ref.offsetHeight]);

  return offsetHeight;
};

/**
 * @description: 获取上一个状态
*/
export const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

/**
 * @description: 统一时间格式
 * @param {Date} date 时间日期
 * @param {string} format 时间格式 默认："YYYY-MM-DD HH:mm:ss"
*/
export const timerFormat = (date, format = "YYYY-MM-DD HH:mm:ss") => date ? moment(date).format(format) : null

/**
 * @description: 下载文件使用
*/
export const downloadBlobFile = (data, name) => {
  const blob = new Blob([data], { type: 'application/vnd.ms-excel,charset=utf-8' })
  const fileName = name
  if ('download' in document.createElement('a')) { // 非IE下载
    const elink = document.createElement('a')
    elink.download = fileName
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) // 释放URL 对象
    document.body.removeChild(elink)
  } else { // IE10+下载
    navigator.msSaveBlob(blob, fileName)
  }
}

/**
  * @description: 返回对相应的数据类型
  */
function getType(data) {
  return Object.prototype.toString.call(data).substring(8).split(/]/)[0]
}

/**
 * @param {*} sourceObj
 * @param {*} compareObj
 * 
 * 比较对象是否相等
 */
export function comparisonObject(sourceObj, compareObj) {
  // eslint-disable-next-line no-throw-literal
  if (arguments.length < 2) throw "Incorrect number of parameters";
  const sourceType = getType(sourceObj);
  if (sourceType !== getType(compareObj)) return false;
  // Not objects and arrays
  if (sourceType !== "Array" && sourceType !== "Object" && sourceType !== "Set" && sourceType !== "Map") {
    if (sourceType === "Number" && sourceObj.toString() === "NaN") {
      return compareObj.toString() === "NaN"
    }
    if (sourceType === "Date" || sourceType === "RegExp") {
      return sourceObj.toString() === compareObj.toString()
    }
    return sourceObj === compareObj
  }
  if (sourceType === "Array") {
    if (sourceObj.length !== compareObj.length) return false;
    if (sourceObj.length === 0) return true;
    for (let i = 0; i < sourceObj.length; i += 1) {
      if (!comparisonObject(sourceObj[i], compareObj[i])) return false;
    }
  } else if (sourceType === "Object") {
    const sourceKeyList = Reflect.ownKeys(sourceObj);
    const compareKeyList = Reflect.ownKeys(compareObj);
    let key;
    if (sourceKeyList.length !== compareKeyList.length) return false;
    for (let i = 0; i < sourceKeyList.length; i += 1) {
      key = sourceKeyList[i];
      if (key !== compareKeyList[i]) return false;
      if (!comparisonObject(sourceObj[key], compareObj[key])) return false;
    }
  } else if (sourceType === "Set" || sourceType === "Map") {
    // 把 Set Map 转为 Array
    if (!comparisonObject(Array.from(sourceObj), Array.from(compareObj))) return false;
  }
  return true;
}

/**
 *  @description: 获取弹窗模式
 * @param {number} editType 模式 1:新增 2:编辑 3:查看
*/
export function getModel(editType) {
  switch (editType) {
    case 3:
      return "查看"
    case 2:
      return "编辑"
    case 1:
      return "新增"
    default:
      return '-'
  }
}


// 常用的一些正则表达式
/**
 *  @description: 座机号码验证
*/
export const REGEXP_LANDLINE = /(?:(\\(\\+?86\\))(0[0-9]{2,3}-?)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?)|(?:(86-?)?(0[0-9]{2,3}-?)?([2-9][0-9]{6,7})+(\\-[0-9]{1,4})?)/

/**
 *  @description: 手机号码验证
*/
export const REGEXP_PHONE = /^[1][2,3,4,5,6,7,8,9][0-9]{9}$/

/**
 *  @description: 邮箱号验证
*/
export const REGEXP_EMAIL = /[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/