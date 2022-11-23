import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Select, TreeSelect, Pagination, Input } from 'antd';
import ReactDom from 'react-dom';
import { request } from '@/utils';
import { comparisonObject } from '../utils';

const { Option } = Select;
const { TreeNode } = TreeSelect;
const { Search } = Input;

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
      pageInfo,
      searchProperties,
      ...props
    },
    ref,
  ) => {

    const [lodaing, setLoading] = useState(false);
    const [reqOptions, setReqOptions] = useState([]);
    const [params, setParams] = useState(cascadeParams);
    const [v, setV] = useState(undefined);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [open, setOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const pageInfoObj = typeof pageInfo === "object" ? { rows: 30, ...pageInfo } : { rows: 30 }
    const selectRef = useRef();
    const pageRef = useRef();
    const searchRef = useRef();

    useImperativeHandle(ref, () => ({ selectRef }));

    useEffect(() => {
      document.addEventListener('mousedown', hide, true);
      return () => document.removeEventListener('mousedown', hide, true);
    }, [])

    useEffect(() => {
      setV(value);
    }, [value]);

    useEffect(() => {
      if (!store) return
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

    useEffect(() => {
      getData()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, searchVal])

    function getData(params = cascadeParams) {
      if (!store) return
      let searchObj = {}
      if (searchProperties) searchObj = { quickSearchProperties: searchProperties, quickSearchValue: searchVal, }
      setLoading(true);
      request({
        ...store,
        ...params,

        // data数据
        data: {
          // 其他参数
          ...(params?.data || {}), ...(store?.data || {}),
          // 分页参数
          pageInfo: pageInfo ? { ...pageInfoObj, page: current, } : undefined,
          ...searchObj,
        }
      })
        .then(({ data }) => {
          let optitons = []
          if (Array.isArray(data)) {
            optitons = data
          } else if (Array.isArray(data?.rows)) {
            setCurrent(data.page);
            setTotal(data.records);
            optitons = data?.rows
          }
          setReqOptions(optitons.map(res => {
            return {
              value: res[reader.value],
              label: res[reader.label],
              data: res,
            };
          }));
        })
        .finally(() => setLoading(false));
    }

    function onChangePage(page) {
      setCurrent(page)
    }

    function hide(e) {
      const tDom = ReactDom.findDOMNode(selectRef.current)
      const pDom = ReactDom.findDOMNode(pageRef.current)
      const sDom = ReactDom.findDOMNode(searchRef.current)

      if (tDom?.contains(e.target) || pDom?.contains(e.target) || sDom?.contains(e.target)) {
        // 暂无需求
      } else {
        setTimeout(() => {
          setOpen(false)
        }, 100)
      }
    }

    function show(val) {
      if (val) {
        setOpen(val);
        // 重置搜索框
        // setSearchVal('');
      }
    }

    const option = (item, k) => {
      if (optionRender) {
        return (
          <Option
            data={item.data}
            key={`${k}-${item.value}`}
            value={dataTypeFun(item.value)}
            label={item.label}
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
          label={item.label}
        >
          {item.label}
        </Option>
      );
    };

    const searchMode = (pageInfo || searchProperties) ? {
      open,
      onDropdownVisibleChange: show
    } : {}
    const opt = options || reqOptions;
    return (
      <Select
        {...searchMode}
        loading={lodaing}
        remotePaging
        style={style}
        // 搜索
        showSearch
        optionFilterProp='label'
        {...props}
        onChange={(val, datas) => {
          const data = datas && datas.props && datas.props.data;
          onChange(val, data);
          setV(val);
        }}
        // onKeyDown={keyDown}
        // onSelect={() => setOpen(false)}
        // onMouseDown={e => e.preventDefault()}
        ref={selectRef}
        value={v}
        dropdownRender={menu => (
          <div>
            {
              searchProperties
              && store
              && <div
                style={{ padding: "8px 8px 0 8px", display: "flex", justifyContent: "center", alignItems: "center", borderTop: "1px solid rgb(222, 222, 222)" }}
                ref={searchRef}
              >
                <Search onSearch={(val) => setSearchVal(val)} />
              </div>
            }
            {menu}
            {
              pageInfo
              && <div
                style={{ height: "42px", display: "flex", justifyContent: "center", alignItems: "center", borderTop: "1px solid rgb(222, 222, 222)" }}
                ref={pageRef}
              >
                <Pagination
                  simple
                  disabled={lodaing}
                  current={current}
                  total={total}
                  pageSize={pageInfoObj.rows}
                  onChange={onChangePage}
                />
              </div>
            }
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
 * @param {Function} loadData 可以，加载数据自定义加载函数
 * @param {boolean} inTheOuter 打包时是否需要数组包裹一下
 * @param {boolean} openLoad 点开下拉框就请求一次数据
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
    openLoad = false,
    childrenStr = 'children',
    treeNodeProps = () => ({}),
    cascadeParams = {},
    loadData,
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
    onDropdownVisibleChange={(flag) => { if (flag && openLoad) getData() }}
    ref={ref}
    searchPlaceholder="快速搜索"
    treeNodeFilterProp="title" // 搜索使用 title 字段
    loadData={loadData ? (treeNode) => loadData(treeNode, setReqOptions) : undefined}
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
  </TreeSelect >
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

