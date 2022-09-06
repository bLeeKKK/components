import React, { forwardRef, useState, useEffect } from 'react';
import { Select, TreeSelect } from 'antd';
import { request } from '@/utils';
import { comparisonObject } from '../utils'

const { Option } = Select;
const { TreeNode } = TreeSelect;

let timer = null;
export const MySelect = forwardRef(
  (
    {
      options,
      onChange = () => null,
      value,
      store = null,
      reader = {
        label: "dataName",
        value: "dataValue"
      },
      style,
      optionRender, // 传入 option 自定义样式
      otherLine = [],
      dataTypeFun = v => v, // 保证返回的数据类型 就行装换
      cascadeParams = {},
      ...props
    },
    ref,
  ) => {

    const [lodaing, setLoading] = useState(false);
    const [reqOptions, setReqOptions] = useState([]);
    const [params, setParams] = useState(cascadeParams);
    const [v, setV] = useState(undefined);

    useEffect(() => {
      setV(value);
    }, [value]);

    useEffect(() => {
      if (!store) {
        return
      }
      if (cascadeParams === params) {
        // 第一次进入数据一样
        getData(cascadeParams)
      }
      
      // 深度比较对象
      const flag = comparisonObject(cascadeParams, params);
      if (!flag) {
        setParams(cascadeParams);
        getData(cascadeParams);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cascadeParams])

    function onSearch() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(getData, 1000);
    }

    function getData(params = {}) {
      request({
        ...store,
        ...params,
      })
        .then(({ data }) => {
          let optitons = []
          if (Array.isArray(data)) {
            optitons = data
          } else if (Array.isArray(data?.rows)) {
            optitons = data?.rows
          }
          setReqOptions(optitons.map(res => {
            return {
              value: res[reader.value],
              label: res[reader.label],
              data: res,
            };
          }));
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }

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

    let opt = options || reqOptions;

    return (
      <Select
        loading={lodaing}
        remotePaging={true}
        style={style}
        onSearch={onSearch}
        {...props}
        onChange={(val, datas) => {
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
    treeNodeProps = () => ({}),
    cascadeParams = {},
    ...props
  },
  ref
) => {
  const [reqOptions, setReqOptions] = useState();
  const [params, setParams] = useState(cascadeParams);

  useEffect(() => {
    if (!store) {
      return
    }
    if (cascadeParams === params) {
      // 第一次进入数据一样
      getData(cascadeParams);
    }

    // 深度比较对象
    const flag = comparisonObject(cascadeParams, params)
    if (!flag) {
      setParams(cascadeParams);
      getData(cascadeParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])

  function getData(params = {}) {
    request({
      ...store,
      ...params,
    })
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

  const nOptions = reqOptions || options;

  return <TreeSelect
    ref={ref}
    searchPlaceholder="快速搜索"
    treeNodeFilterProp="title" // 搜索使用 title 字段
    {...props}
  >
    {
      renderOptions({
        options: nOptions,
        renderTree,
        reader,
        childrenStr,
        treeNodeProps,
      })
    }
  </TreeSelect>
})

function renderOptions({
  options,
  renderTree,
  reader,
  childrenStr = 'children',
  treeNodeProps = () => ({})
}) {
  if (options && options.length) {
    return options.map(res => {
      let title = res[reader.label]
      if (renderTree) {
        title = renderTree(res)
      }
      return <TreeNode
        data-node={res}
        value={res[reader.value]}
        title={title}
        key={res[reader.value]}
        children={
          renderOptions({
            options: res[childrenStr],
            renderTree,
            reader,
            childrenStr,
            treeNodeProps,
          })
        }
        {...treeNodeProps(res)}
      />
    })
  }
}

