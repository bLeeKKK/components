import React, { useState, useEffect, forwardRef } from 'react';
import { request } from '@/utils';
import { EBOC_BAF_SERVICE } from '@/utils/commonUrl';
import { Cascader, Input } from 'antd';
import constants from '@/utils/constants';

const { SERVER_PATH } = constants;
const bafAddressFindByPage = data =>
  request({
    url: `${SERVER_PATH}/${EBOC_BAF_SERVICE}/bafAddress/findByPage`,
    method: 'post',
    data,
  });

let optionsArr = [];
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
      getPlace()
        .then(arr => {
          setOptions(arr);
        });
    }, []);

    useEffect(() => {
      if (Array.isArray(props?.value)) {
        if (props.value.some(res => +res)) {
          valueSetOptions(props.value)
        } else {
          setInputShow(props?.value)
        }
      }
    }, [props.value])

    function setOptions(v) {
      optionsArr = v;
      setOptionsOne(v);
    }
    function getPlace(code = '100000000000', isLeaf = false) {
      // 根据 code 获取地区列表
      return bafAddressFindByPage({
        filters: [
          {
            fieldName: 'parentCode',
            operator: 'EQ',
            value: code,
          },
        ],
      }).then(({ success, data = {} }) => {
        if (success) {
          const { rows = [] } = data;
          return rows.map(item => {
            return {
              value: item.code,
              label: item.name,
              isLeaf: level === 0 || isLeaf,
            };
          });
        }
      });
    }

    const onChangeInner = (value, selectedOptions) => {
      setInputShow(selectedOptions?.map(res => res.label))
      onChange(value, selectedOptions);
    };

    const loadData = selectedOptions => {
      const len = selectedOptions.length;
      const targetOption = selectedOptions[len - 1];
      targetOption.loading = true;
      getPlace(targetOption.value, len === level)
        .then(res => {
          targetOption.loading = false;
          targetOption.children = res;
          setOptions([...options]);
        });
    };

    function valueSetOptions(arr, key = 0, objArr, inputShowNeedArr = []) {
      // 传入基础 value 值，自动获取数据
      const targetOption = (objArr || optionsArr)
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
      setInputShow(showVal)
      getPlace(arr[key], key === lastIndex - 1)
        .then(res => {
          targetOption.loading = false;
          if (key != lastIndex) {
            targetOption.children = res;
          }
          setOptions([...optionsArr]);
          if (key < lastIndex) {
            valueSetOptions(arr, key + 1, targetOption.children, showVal);
          }
        });
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

export default Place;
