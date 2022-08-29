import React, { forwardRef, useState, useEffect } from 'react';
import { Select, TreeSelect } from 'antd';
import { request } from '@/utils';

const { Option } = Select;
const { TreeNode } = TreeSelect;

export const MySelect = forwardRef(
  (
    {
      options,
      onChange = () => null,
      value,
      store = null,
      reader,
      style,
      optionRender, // 传入 option 自定义样式
      otherLine = [],
      typereqplay = 'findByPage',
      dataTypeFun = v => v, // 保证返回的数据类型 就行装换
      ...props
    },
    ref,
  ) => {
    const [v, setV] = useState(undefined);
    useEffect(() => {
      if (!value && value !== 0 && value !== false) {
        setV(undefined);
        return;
      }
      setV(value);
    }, [value]);
    const option = (item, k) => {
      if (optionRender) {
        return (
          <Option
            data={item.data}
            key={`${k}-${item.value}`}
            value={dataTypeFun(item.value)}
          >
            {optionRender(item)}
          </Option>
        );
      }
      return (
        <Option
          data={item.data}
          key={`${k}-${item.value}`}
          value={dataTypeFun(item.value)}
        >
          {item.label}
        </Option>
      );
    };

    let opt = options

    return (
      <Select
        remotePaging={true}
        style={style}
        {...props}
        onChange={(val, datas) => {
          // console.log(val, datas)
          const data = datas && datas.props && datas.props.data;
          onChange(val, data);
          setV(val);
        }}
        ref={ref}
        value={v}
        dropdownRender={menu => (
          <div>
            {menu}
          </div>
        )}
      >
        {otherLine.map(option)}
        {opt && opt.length ? [...(props?.defaultDataArr || []), ...opt,].map(option) : [...(props?.defaultDataArr || [])].map(option)}
      </Select>
    );
  },
);

/**
 * @description: 树状选择组件
 * @param {Array<{children}>} options 外部传如列表
 * @param {} store 是否使用网络请求数据
 * @param {Function} renderTree 渲染显示，参数带入每个行项
 * @param {boolean} inTheOuter 打包时是否需要数组包裹一下
 * @return: 树状选择框
 * 
 * options 和 store 至少存在一个！！！
 * 
*/
export const MyTreeSelect = forwardRef((
  {
    options,
    reader = { value: 'key', label: 'title' },
    renderTree,
    store,
    inTheOuter = false,
    childrenStr = 'children',
    ...props
  },
  ref
) => {
  const [reqOptions, setReqOptions] = useState();

  useEffect(() => {
    if (store) {
      request(store)
        .then(({ success, data }) => {
          if (success) {
            /**
             * inTheOuter 为true时，使用[]包裹一下
            */
            if (inTheOuter && data) {
              setReqOptions([data]);
              return
            }

            if (Array.isArray(data)) setReqOptions(data);
            else if (Array.isArray(data?.rows)) setReqOptions(data.rows);
          } else {
            setReqOptions(undefined)
          }
        })
    }
  }, [store, inTheOuter])

  const nOptions = reqOptions || options;

  return <TreeSelect
    ref={ref}
    searchPlaceholder="快速搜索"
    treeNodeFilterProp="title" // 搜索使用 title 字段
    {...props}
  >
    {renderOptions(nOptions, renderTree, reader, childrenStr)}
  </TreeSelect>
})

function renderOptions(options, renderTree, reader, children = 'children') {
  if (options && options.length) {
    return options.map(res => {
      let title = res[reader.label]
      if (renderTree) {
        title = renderTree(res)
      }
      return <TreeNode
        value={res[reader.value]}
        title={title}
        key={res[reader.value]}
        children={renderOptions(res[children], renderTree, reader, children)}
      />
    })
  }
}

