import { useLayoutEffect, useState } from 'react'
import moment from 'moment';

/**
 * @description: 统一时间格式的展示
 * @param {date} date 对应 时间日期
 * @return: 返回处理好的时间格式
 * 
*/
export const rowShowTime = (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';

/**
 * @description: 找到配置项中的对应value值
 * @param {{label: string, value: string | number | boolean}[]} options 数组
 * @param {string | number | boolean} val 对应 value
 * @return: 返回对应对象的 lable
 * 
*/
export const optionFindLable = (options, val) => options.find(re => re.value === val)?.label;

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
  usePlace,
  noTypeData,
  dateFormat = 'YYYY-MM-DD',
  fieldDate,
}) => {
  if (!obj) {
    return []
  }
  const keys = Object.keys(obj);
  const arrFilter = [];
  keys.forEach(item => {
    const [operator, fieldName, type] = item.split('_');
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
    if (type === 'treeSelect' && obj[item] && obj[item].length === 0) {
      obj[item] = undefined;
    }
    if (type === 'rangePicker' && rangePickerMode === 'arr' && obj[item]) {
      if (noTypeData) {
        const arr = [];
        obj[item].forEach((i) => {
          arr.push(moment(i).format(dateFormat));
        });
        obj[item] = arr;
        fieldType = null;
      } else {
        const arr = [];
        obj[item].forEach((i) => {
          arr.push(moment(i).format(dateFormat));
        });
        obj[item] = arr;
        fieldType = fieldDate || (dateFormat === 'YYYY-MM-DD' ? 'date' : 'datetime');
      }
    } else if (type === 'rangePicker' && rangePickerMode === 'list' && obj[item]) {
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
    }
    // else if (type === 'place') {
    //   if (!usePlace) {
    //     return;
    //   }
    // }

    arrFilter.push({
      fieldName,
      operator,
      value: typeof obj[item] === 'string' ? obj[item].trim() : obj[item],
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

  const [clientHeight, setClientHeight] = useState(0);

  useLayoutEffect(() => {
    if (ref && ref.clientHeight) {
      setClientHeight(ref.clientHeight);
    } else {
      setClientHeight(0)
    }
  }, [ref, ref.clientHeight]);

  return clientHeight;
};