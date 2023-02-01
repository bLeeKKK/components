import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Select, TreeSelect, Pagination, Input, Icon, Table } from 'antd';
import ReactDom from 'react-dom';
import { CancelToken } from 'axios';
import { useUpdateEffect, useCreation, useControllableValue, useAntdTable, useDebounce } from 'ahooks';
import { request } from '@/utils';
import { comparisonObject } from '../utils';

const { Option } = Select;
const { TreeNode } = TreeSelect;
const { Search } = Input;

/**
 * @description 自定义下拉框
 * @param {Array} options 传入的数据
 * @param {Function} onChange 选择后的回调
 * @param {String} value 选中的值
 * @param {Object} store 请求的数据
 * @param {Object} reader 读取数据的字段
 * @param {Object} style 样式
 * @param {Function} optionRender 自定义 option 样式
 * @param {Function} optionProps 自定义 option 属性
 * @param {Array} otherLine 其他行，用于自定义写死的数据
 * @param {Function} dataTypeFun 保证返回的数据类型 就行装换
 * @param {Object} cascadeParams 级联参数
 * @param {Object} pageInfo 分页参数
 * @param {Object} searchProperties 搜索参数
 * @param {Object} props 其他参数
 * 
 * */ 
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
      optionProps = () => ({}),
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
    const flagReq = useCreation(() => ({ cancel: null }))

    useImperativeHandle(ref, () => ({ selectRef }));

    useEffect(() => {
      document.addEventListener('mousedown', hide, true);
      return () => document.removeEventListener('mousedown', hide, true);
    }, [])

    useEffect(() => {
      setV(value);
    }, [value]);

    useUpdateEffect(() => {
      if (!store) return
      if (cascadeParams === params) {
        // 第一次进入数据一样
        getData(cascadeParams)
        return
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

    function getData(p = cascadeParams) {
      if (!store) return
      let searchObj = {}
      if (searchProperties) searchObj = { quickSearchProperties: searchProperties, quickSearchValue: searchVal, }
      setLoading(true);
      request({
        ...store,
        ...p,

        // data数据
        data: {
          // 分页参数
          pageInfo: pageInfo ? { ...pageInfoObj, page: current, } : undefined,
          // 其他参数
          ...(p?.data || {}), ...(store?.data || {}),
          ...searchObj,
        },

        // 自己取消请求
        // headers: { neverCancel: true },
        cancelToken: new CancelToken(cancelFn => {
          if (flagReq.cancel) flagReq.cancel('cancel')
          flagReq.cancel = cancelFn
        })
      })
        .then(({ data, success }) => {
          if (!success) return
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

    const onChangePage = (page) => {
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
            {...(optionProps(item))}
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
          {...(optionProps(item))}
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

  function getData(p = {}) {
    request({
      ...store,
      ...p,
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
        // eslint-disable-next-line react/no-children-prop
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


/**
 * @description: 表格选择
 * @param {{ url: string, method: "POST" | "GET", data: Object }} store 外部传如列表
 * @param {Array} columns 表格列
 * @param {string} name 表单name
 * @param {Form} form 表单
 * @param {Object} style 样式
 * @param {string} mode 多选还是单选 checkbox | radio
 * @param {Function} optionRender 自定义渲染
 * @param {Object} reader 读取器
 * @param {Function} afterSelect 选择后的回调
 * @param {number} dropdownHeight 下拉框高度
 * @param {number} dropdownWidth 下拉框宽度
 * @param {Object} props 其他参数 适用到 <Select /> 组件上
 * 
 * 现在必须使用接口请求数据，也就是store必传。后续有需求再改
 * 
*/
export const MyTableSelect = forwardRef(
  (
    {
      store = {},
      columns = [],
      name,
      form = {},
      style,
      mode = 'checkbox',
      optionRender,
      reader = {
        label: 'name',
        value: 'id',
      },
      afterSelect = () => { },
      dropdownHeight = 500,
      dropdownWidth = 400,
      ...props
    },
    ref,
  ) => {
    const flagReq = useCreation(() => ({ cancel: null }))
    const [searchVal, setSearchVal] = useState('');
    const debouncedSearchVal = useDebounce(searchVal, { wait: 600 });
    const { tableProps } = useAntdTable(
      ({ current, pageSize }) => {
        return request({
          ...store,
          data: {
            quickSearchValue: debouncedSearchVal,
            pageInfo: { page: current, rows: pageSize },
            ...(store?.data || {}),
          },

          // 自己取消请求
          cancelToken: new CancelToken(cancelFn => {
            if (flagReq.cancel) flagReq.cancel('cancel')
            flagReq.cancel = cancelFn
          })
        })
          .then(({ success, data }) => {
            if (success) {
              return {
                total: data.records,
                list: data.rows
              }
            }
            return { total: 0, list: [] }
          });
      },
      {
        refreshDeps: [debouncedSearchVal],
        defaultPageSize: 10
      }
    );
    const { dataSource } = tableProps
    const [open, setOpen] = useState(false);
    const [v, setV] = useControllableValue(props, { defaultValue: [] });

    const handleSelectedRows = (...parameter) => {
      afterSelect(...parameter);
      setV(parameter[0]);
      form.setFieldsValue({
        [name]: parameter[0],
      });
      if (mode !== 'checkbox') {
        setOpen(false);
      }
    }
    const option = (item) => {
      const label = item[reader.label]
      const value = item[reader.value]
      if (optionRender) {
        return (
          <Option data={item} value={value} key={value}>
            {optionRender(item)}
          </Option>
        );
      }
      return (
        <Option data={item} value={value} key={value}>
          {label}
        </Option>
      );
    };
    const selectRow = (record) => {
      const selectedRowKeys = [...v];
      if (selectedRowKeys.indexOf(record[reader.value]) >= 0) {
        selectedRowKeys.splice(selectedRowKeys.indexOf(record[reader.value]), 1);
      } else {
        selectedRowKeys.push(record[reader.value]);
      }
      setV(selectedRowKeys)
    }

    useEffect(() => {
      if (open && searchVal !== '') setSearchVal('');
      const val = form.getFieldValue(name);
      if (!val) {
        setV([]);
      } else {
        setV(val);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
      <Select
        ref={ref}
        onSearch={sv => setSearchVal(sv)}
        showSearch
        autoClearSearchValue
        open={open}
        mode={mode === 'checkbox' ? 'multiple' : 'tag'}
        onDropdownVisibleChange={setOpen}
        value={v}
        placeholder="Select"
        dropdownMatchSelectWidth={false}
        onDeselect={val => {
          const newV = [...v];
          const index = newV.findIndex(res => res === val);
          newV.splice(index, 1);
          handleSelectedRows(newV);
        }}
        clearIcon={
          <Icon
            type="close"
            onClick={e => {
              handleSelectedRows([]);
              e.stopPropagation();
            }}
          />
        }
        dropdownRender={() => {
          return (
            <div>
              {open && (
                <div onMouseDown={e => e.preventDefault()}>
                  <Table
                    scroll={{ x: dropdownWidth, y: dropdownHeight }}
                    columns={columns}
                    rowKey={(item, index) => item[reader.value] || `数据报错-${index}`}
                    rowSelection={{
                      type: mode,
                      selectedRowKeys: v,
                      onChange: (...p) => handleSelectedRows(...p)
                    }}
                    size="small"
                    bordered
                    onRow={(record) => ({
                      onClick: () => {
                        selectRow(record);
                      },
                    })}
                    {...tableProps}
                  />
                </div>
              )}
            </div>
          );
        }}
        {...props}
        style={style}
      >
        {dataSource.map(option)}
      </Select >
    );
  },
);

// MyTableSelect 的备用组件
// export const MyTableSelect2 = forwardRef(
//   (
//     {
//       store = {},
//       columns = [],
//       name,
//       form = {},
//       style,
//       mode = 'checkbox',
//       optionRender,
//       reader = {
//         label: 'name',
//         value: 'id',
//       },
//       afterSelect = () => { },
//       // onChange = () => { },
//       height = 500,
//       ...props
//     },
//     ref,
//   ) => {
//     const [open, setOpen] = useState(false);
//     const [opinData, setOpinData] = useState([]);
//     const [v, setV] = useControllableValue(props, { defaultValue: [] });
//     const tableRef = useRef(null);
//     const [searchVal, setSearchVal] = useState('');

//     const handleSelectedRows = (...parameter) => {
//       afterSelect(...parameter);
//       setV(parameter[0]);
//       form.setFieldsValue({
//         [name]: parameter[0],
//       });
//       if (mode !== 'checkbox') {
//         setOpen(false);
//       }
//     }

//     const { run: handleSearch } = useThrottleFn(
//       (vals) => {
//         setSearchVal(vals);
//         if (tableRef.current) tableRef.current.remoteDataRefresh();
//       },
//       { wait: 600 },
//     );

//     useEffect(() => {
//       if (open && searchVal !== '') handleSearch('');
//       const val = form.getFieldValue(name);
//       if (!val) {
//         setV([]);
//       } else {
//         setV(val);
//       }
//     }, [open]);

//     const { params = {} } = store;

//     const option = (item) => {
//       if (optionRender) {
//         return (
//           <Option data={item.data} value={item.value} key={item.value}>
//             {optionRender(item)}
//           </Option>
//         );
//       }
//       return (
//         <Option data={item.data} value={item.value} key={item.value}>
//           {item.label}
//         </Option>
//       );
//     };

//     return (
//       <Select
//         ref={ref}
//         onSearch={sv => handleSearch(sv)}
//         showSearch
//         autoClearSearchValue
//         open={open}
//         mode={mode === 'checkbox' ? 'multiple' : 'tag'}
//         onDropdownVisibleChange={setOpen}
//         value={v}
//         placeholder="Select"
//         dropdownMatchSelectWidth={false}
//         onDeselect={val => {
//           const newV = [...v];
//           const index = newV.findIndex(res => res === val);
//           newV.splice(index, 1);
//           handleSelectedRows(newV);
//         }}
//         clearIcon={
//           <Icon
//             type="close"
//             onClick={e => {
//               handleSelectedRows([]);
//               e.stopPropagation();
//             }}
//           />
//         }
//         dropdownRender={() => {
//           return (
//             <div>
//               {open && (
//                 <div onMouseDown={e => e.preventDefault()}>
//                   <ExtTable
//                     ref={tableRef}
//                     columns={columns}
//                     showSearch={false}
//                     rowKey={(item, index) => {
//                       return item[reader.value] || `数据报错-${index}`
//                     }}
//                     allowCancelSelect
//                     bordered
//                     size="small"
//                     height={height}
//                     remotePaging
//                     ellipsis={false}
//                     selectedRowKeys={v}
//                     lineNumber={false}
//                     onSelectRow={handleSelectedRows}
//                     checkbox={
//                       mode === 'checkbox' || {
//                         checkType: 'radio',
//                         multiSelect: false,
//                       }
//                     }
//                     // showSearch={true}
//                     pagination={{ showSizeChanger: false }}
//                     store={{
//                       ...store,
//                       params: { quickSearchValue: searchVal, ...params },
//                       loaded: (re) => {
//                         const { data: { rows = [] } } = re;
//                         if (store && store.callback) store.callback(re, form);
//                         setOpinData(
//                           rows.map(res => {
//                             return {
//                               value: res[reader.value],
//                               label: res[reader.label],
//                               data: res,
//                             };
//                           }),
//                         );
//                       },
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//           );
//         }}
//         {...props}
//         style={{
//           // margin: "4px 0",
//           ...style,
//         }}
//       >
//         {opinData.map(option)}
//       </Select >
//     );
//   },
// );
