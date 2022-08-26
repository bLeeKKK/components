import React, { useState, useEffect, forwardRef } from 'react';
import { request } from '@/utils';
import { EBOC_BAF_SERVICE } from '@/utils/commonUrl';
import { Cascader } from 'antd';
import constants from '@/utils/constants';

const { SERVER_PATH } = constants;
const bafAddressFindByPage = (data) =>
  request({
    url: `${SERVER_PATH}/${EBOC_BAF_SERVICE}/bafAddress/findByPage`,
    method: 'post',
    data,
  });



const obj = {}
let optionsArr = []
/**
 * @param{level} 展示到的地区等级 0: 到省 1: 到市 2: 到县 3: 到区（默认）
 * 
*/


function Place({
  form,
  onChange = () => { },
  value = [],
  name = '',
  level = 3,
  ...props
}, ref) {
  const [options, setOptionsOne] = useState([])
  const [v, setV] = useState([])

  useEffect(() => {
    getPlace().then(arr => {
      setOptions(arr)
      setPlaceValue(form.getFieldValue(name))
    })
  }, [])

  function setOptions(v) {
    optionsArr = v
    setOptionsOne(v)
  }
  function getPlace(code = '100000000000', isLeaf = false) {
    // 根据 code 获取地区列表
    return bafAddressFindByPage({
      filters: [{
        fieldName: 'parentCode',
        operator: 'EQ',
        value: code,
      }]
    })
      .then(({ success, data = {} }) => {
        if (success) {
          const { rows = [] } = data
          return rows.map(item => {
            return {
              value: item.code,
              label: item.name,
              isLeaf: level === 0 || isLeaf
            }
          })
        }
      })
  }

  const onChangeInner = (value, selectedOptions) => {
    setV(value)
    onChange({ value, selectedOptions })
  }

  const loadData = selectedOptions => {
    const len = selectedOptions.length;
    const targetOption = selectedOptions[len - 1];
    targetOption.loading = true
    getPlace(targetOption.value, len === level).then(res => {
      targetOption.loading = false;
      targetOption.children = res;
      setOptions([...options]);
    })
  }

  function setPlaceValue(arr = []) {
    setV(arr)
    form.setFieldsValue({
      [name]: arr
    })
    if (arr.length) {
      valueSetOptions(arr) // 自动递归请求接口数据
    }
  }

  function valueSetOptions(arr, key = 0, objArr) {
    // 传入基础 value 值，自动获取数据
    const targetOption = (objArr || optionsArr).find(ele => {
      return ele.value === arr[key]
    })
    const lastIndex = 3
    if (!targetOption || targetOption.children) {
      // 找不到对应的父级元素，就不在继续查询子元素
      return
    }
    getPlace(arr[key], key === lastIndex - 1).then(res => {
      targetOption.loading = false
      if (key != lastIndex) {
        targetOption.children = res
      }
      setOptions([...optionsArr])
      if (key < lastIndex) {
        valueSetOptions(arr, key + 1, targetOption.children)
      }
    })
  }

  form.placeSetFun = {
    ...obj,
    [name]: setPlaceValue
  }

  return (
    <Cascader
      options={options}
      loadData={loadData}
      onChange={onChangeInner}
      changeOnSelect
      value={v}
      name={name}
      {...props}
    />
  )
}

export default forwardRef(Place)