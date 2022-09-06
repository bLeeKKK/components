import React, { useState, useEffect, forwardRef } from 'react';
import { request } from '@/utils';
import { Cascader, Input } from 'antd';
import constants from '@/utils/constants';

const { SERVER_PATH } = constants;
const getDataPlace = id =>
  request({
    url: `${SERVER_PATH}/dms/region/getMultipleRoots?nodeId=${id}&includeSelf=false`,
    method: 'get',
  });

let optionsArr = []; // 用于优化数据不用一次性处理
let valNew = []; // 第一次加载，设置准确的数值
/**
 * @param {number} level 展示到的地区等级 0: 到省 1: 到市 2: 到县 3: 到区（默认）
 * @param {boolean} showInputON 是否让【options】中无对应数据的，value展示出来
 */
const Place = forwardRef(
  (
    {
      level = 3,
      onChange,
      showInputON = false,
      ...props
    },
    ref
  ) => {
    const [options, setOptionsOne] = useState([]);
    const [inputShow, setInputShow] = useState(undefined) // 只是用来展示使用

    useEffect(() => {
      getDataPlace('7263AF23-636A-11EA-993B-0242C0A84411')
        .then(({ success, data = [] }) => {
          if (success) {
            const arr = data[0]?.children || [];
            const options = packaging(arr);
            setOptions(options);

            // 第一次记载组件时，还没返回数据，自动设置不能完成
            setTimeout(() => {
              valueSetOptions(valNew);
            }, 0);
          }
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      valNew = props.value
      if (Array.isArray(props?.value)) {
        if (props.value.some(res => +res)) {
          valueSetOptions(props.value)
        } else {
          setInputShow(props?.value)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value])

    function setOptions(v) {
      optionsArr = v;
      setOptionsOne(v);
    }

    const onChangeInner = (value, selectedOptions) => {
      setInputShow(selectedOptions?.map(res => res.label))
      onChange(value, selectedOptions);
    };

    const loadData = selectedOptions => {
      const len = selectedOptions.length;
      const targetOption = selectedOptions[len - 1];
      targetOption.children = packaging(targetOption.son)
      setOptions([...options]);
    };

    function valueSetOptions(arr, key = 0, objArr, inputShowNeedArr = []) {
      // 传入基础 value 值，自动获取数据
      if (!arr?.length) {
        // 没有可设置参数时，不继续执行
        return
      }
      const targetOption = (objArr || optionsArr || [])
        .find(ele => {
          return ele.value === arr[key];
        });
      const lastIndex = 3;

      if (!targetOption || targetOption.children) {
        // 找不到对应的父级元素，就不在继续查询子元素
        // 如果已经存在子元素，就不再去查询接口
        return;
      }
      const showVal = [...inputShowNeedArr, targetOption.label]
      setInputShow(showVal);

      if (key !== lastIndex) {
        targetOption.children = packaging(targetOption.son);
      }
      setOptions([...optionsArr]);
      if (key < lastIndex) {
        valueSetOptions(arr, key + 1, targetOption.children, showVal);
      }
    }

    if (props?.form?.resetFields) {
      const resetFun = props.form.resetFields
      props.form.resetFields = () => {
        resetFun();
        setInputShow(undefined);
      }
    }

    return (<>
      <Cascader
        loadData={loadData}
        onChange={onChangeInner}
        changeOnSelect
        options={options}
        ref={ref}
        {...props}
      >
        {
          showInputON
            ? <Input
              readonly
              autocomplete="off"
              name={props.name}
              style={{ display: 'inline-block', width: "100%", height: "100%" }}
              value={inputShow?.join('/')}
              placeholder={props?.placeholder}
            />
            : null
        }
      </Cascader>
    </>);
  })


// 处理数据
const packaging = (arr) => arr.map(item => ({
  son: item.children,
  value: item.code,
  label: item.name,
  isLeaf: item.nodeLevel === 3,
}))

export default Place;
