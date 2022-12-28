import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Tree, Select, Checkbox, Layout, Empty, Icon, Spin, Button } from 'antd';
import { request } from '@/utils';
import constants, { SEI_BASIC } from '@/utils/constants';
import { usePrevious } from '../utils'

const { Sider, Content } = Layout;

const { SERVER_PATH } = constants;

const { Option } = Select;

const findOrgTree = () =>
  request({
    url: `${SERVER_PATH}/${SEI_BASIC}/organization/findOrgTree`,
    method: 'get',
  });

const findByOrganizationIdWithoutFrozen = (params) =>
  request({
    url: `${SERVER_PATH}/${SEI_BASIC}/employee/findByOrganizationIdWithoutFrozen`,
    method: 'get',
    params,
  });

const { TreeNode } = Tree;
// const { Search } = Input;

/**
 * 循环展示树节点
 * 
 * keys 获取所有能展开的节点
*/
const loop = (data, filterVal, keys = []) => {
  let arr = []; // 数据体
  for (const item of data) {
    const filterStr = filterVal || undefined; // 过滤字段为【空为字符】时候自动设置为【undefined】
    const flagVal = !!filterStr; // 是否存在，过滤条件
    const flagIn = item.name.includes(filterStr);  // 循环中该项目的【name】是否包含
    const flag = flagIn === flagVal // 同时为【true】时说明该项应该保留，包括所有子集合。同时为【false】说明【flagVal】为【false】，所以也不需要校验过滤。

    if (item.children && item.children.length !== 0) {
      const [son] = loop(item.children, flag ? undefined : filterStr, keys);
      if (flag || son.length) {
        keys.push(item.id);
        arr.push(<TreeNode disabled={item.frozen} key={item.id} title={item.name} data-item={item}>{son}</TreeNode>)
      }
      continue
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    flag && arr.push(<TreeNode disabled={item.frozen} key={item.id} title={item.name} data-item={item} />)
  }
  return [arr, keys]
}

// 【全选】 选中员工框，控制
function onCheckAllChange({ target: { checked } }, userOptions, setSheckedObj) {
  if (checked) {
    const nowAll = userOptions
      .reduce((preObj, item) => {
        return {
          ...preObj,
          [item.id]: item,
        }
      }, {})
    setSheckedObj(obj => ({ ...nowAll, ...obj, }))
  } else {
    setSheckedObj(obj => {
      for (const item of userOptions) {
        delete obj[item.id]
      }
      return { ...obj }
    })
  }
}

// 选中员工【单项】
function handleChangeCheck({ checked, value, dataNode }, setSheckedObj, onlyOneUser) {

  if (checked) {
    setSheckedObj(obj => {
      if (onlyOneUser) return { [value]: dataNode }
      return { ...obj, [value]: dataNode }
    })
  } else {
    setSheckedObj(obj => {
      delete obj[value]
      return { ...obj }
    })
  }
}

function getTreeData({ setTreeData, setLoading }) {
  setLoading(true);
  findOrgTree()
    .then(({ success, data }) => {
      if (success) {
        setTreeData([data]);
      }
    })
    .finally(() => setLoading(false));
}

function getUserList({
  organizationId,
  setUserOptions,
  setLoading,
}) {
  if (!organizationId) {
    setUserOptions([])
    return
  }
  setLoading(true);
  findByOrganizationIdWithoutFrozen({ organizationId })
    .then(({ success, data }) => {
      if (success && Array.isArray(data)) {
        setUserOptions(data)
      }
    })
    .finally(() => setLoading(false))
}

/**
 * @description: 组织选择-员工选择
 * @param {{[key]: Object}} value 组件值
 * @param {boolean} onlyOneMent 是否只能选中一个部门
 * @param {boolean} onlyOneUser 是否只有一个用户
 * */
const SelectUserByOrz = forwardRef((
  {
    value,
    style,
    placeholder = "请选择",
    onChange,
    name,
    form,
    onlyOneMent = false,
    onlyOneUser = false,
    ...props
  },
  ref,
) => {
  const [searchTitle, setSearchTitle] = useState() // 搜索组织机构关键字
  const [treeData, setTreeData] = useState([]); // 组织机构列表【左上】
  const [userOptions, setUserOptions] = useState([]); // 用户选中列表【左下】
  const [checkedObj, setSheckedObj] = useState({}) // 选中项目【右侧】。key值为员工【id】，value值为员工信息的对象
  const [expandedKeys, setExpandedKeys] = useState([]) // 组织机构展开项目
  const [treeDom, setTreeDom] = useState([]) // 组织机构列表
  const [loading, setLoading] = useState(false); // 加载中
  const [open, setOpen] = useState(false);
  const [orz, setOrz] = useState(); // 选中的组织机构
  const beforeCheckedObj = usePrevious(checkedObj); // 上一个状态，选中的状态
  const refSelect = useRef();

  // 当【onlyOneUser】为true时，自动为【onlyOneMent】赋值为 true
  if (onlyOneUser) onlyOneMent = true

  useImperativeHandle(ref, () => ({ refSelect }));

  useEffect(() => {
    if (treeData.length === 0) {
      getTreeData({ setTreeData, setLoading })
      return
    }

    /**
     * treeDom 优化页面展示渲染
     * keys 保障【treeData】默认全部展开
    */
    const [treeDom, keys] = loop(treeData, searchTitle);
    setTreeDom(treeDom);
    setExpandedKeys(keys);
  }, [searchTitle, treeData])

  useEffect(() => {
    if (beforeCheckedObj === checkedObj) {
      setSheckedObj(value || {});
    } else {
      onChange(checkedObj, orz);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, checkedObj]);

  useEffect(() => {
    getUserList({ organizationId: orz?.id, setUserOptions, setLoading })
  }, [orz])

  const selectIngKeys = Object.keys(checkedObj);
  const selectIng = selectIngKeys.map(key => checkedObj[key]);
  const selectAll = userOptions.every(({ id }) => checkedObj[id]); // 判断是否选中所有【userOptions】的
  const checkAllIndeterminate = userOptions.some(({ id }) => checkedObj[id]) && !selectAll; // 判断是否，选中了个别【userOptions】，没有完全选中的状态

  return <>
    {/* <Input value={checkedObj} style={{ display: "none" }} name={name} /> */}
    <Select
      ref={refSelect}
      style={style || { width: '100%' }}
      placeholder={placeholder}
      {...props}
      value={selectIngKeys}
      mode="multiple"
      open={open}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      dropdownMatchSelectWidth={false}
      onSearch={(val) => setSearchTitle(val)}
      onDeselect={(value, { props }) => {
        handleChangeCheck({
          checked: false,
          value,
          dataNode: props['dataNode'],
        }, setSheckedObj, onlyOneUser)
      }}
      dropdownRender={() => {
        return <Spin spinning={loading}>
          <Layout
            onMouseDown={e => e.preventDefault()}
            onFocus={() => setOpen(true)}
          >
            <Layout>
              <Content>
                <Layout>
                  {/* <Search
                    placeholder="搜索组织机构"
                    onSearch={(val) => setSearchTitle(val)}
                  /> */}
                  <Content style={{ height: "400px", padding: '8px', background: '#fff', borderRight: '1px solid #ddd', width: "210px", overflow: "auto" }}>
                    {
                      treeDom.length
                        ? <Tree
                          showLine
                          expandedKeys={expandedKeys}
                          onExpand={(keys) => setExpandedKeys(keys)}
                          switcherIcon={<Icon type="down" />}
                          onSelect={(_, { node, selected }) => {
                            if (onlyOneMent) setSheckedObj({})
                            if (selected) {
                              setOrz(node?.props?.['data-item'])
                            } else {
                              setOrz()
                            }
                          }}
                          filterTreeNode={({ props }) => {
                            if (searchTitle) {
                              return (props.title || '').includes(searchTitle)
                            }
                            return false
                          }}
                        >
                          {treeDom}
                        </Tree>
                        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
                    }
                  </Content>
                </Layout>
              </Content>


              <Sider style={{ padding: "8px" }}>

                {/* 选择用 */}
                <Content style={{ height: "200px", overflow: "auto", background: '#fff', display: 'flex', flexDirection: "column" }}>
                  <h5>待选中</h5>
                  {
                    !onlyOneUser && <Checkbox
                      onFocus={() => refSelect.current.focus()}
                      indeterminate={checkAllIndeterminate}
                      onChange={(e) => onCheckAllChange(e, userOptions, setSheckedObj)}
                      checked={selectAll}
                    >
                      全选
                    </Checkbox>
                  }
                  {
                    userOptions.length
                      ? userOptions.map(res => <Checkbox
                        style={{ marginLeft: '8px' }}
                        onFocus={() => refSelect.current.focus()}
                        key={res.id}
                        value={res.id}
                        onChange={({ target }) => {
                          if (!target) {
                            return
                          }
                          handleChangeCheck(target, setSheckedObj, onlyOneUser)
                        }}
                        dataNode={res}
                        checked={!!checkedObj[res.id]}
                      >{res.userName}</Checkbox>)
                      : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可选择" />
                  }
                </Content>

                {/* 展示用 */}
                <Content style={{ height: "200px", overflow: "auto", background: '#fff', borderTop: '1px solid #ddd' }} >
                  <h5>选中</h5>
                  {
                    selectIng.length
                      ? selectIng.map(res => <>
                        <Checkbox
                          onFocus={() => refSelect.current.focus()}
                          key={res.id}
                          value={res.id}
                          onChange={({ target }) => {
                            if (!target) return
                            handleChangeCheck(target, setSheckedObj, onlyOneUser)
                          }}
                          checked={!!checkedObj[res.id]}
                        >{res.userName}</Checkbox>
                        <br />
                      </>)
                      : <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "center", justifyContent: "center" }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无选中" />
                      </div>
                  }
                </Content>
              </Sider>


            </Layout>

            <div style={{ padding: '8px 16px', textAlign: 'right' }}>
              <Button type="primary" size='small' onClick={() => refSelect.current.blur()}>确定</Button>
            </div>
          </Layout>
        </Spin>
      }}
    >
      {
        selectIng.map(res => <Option key={res.id} dataNode={res}>{res.userName}</Option>)
      }
    </Select>
  </>
})

export default SelectUserByOrz 
