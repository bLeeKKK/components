import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { ExtTable } from '@sei/suid';
import Header from '@/components/Header';
import AdvancedForm, { } from '@/components/AdvancedForm';
import { searchDataPackaged } from '@/components/utils';

const defaultfilterFunc = (val) => val;

const SelectTable = forwardRef(({
  setData = () => { },
  children,
  searchParam,
  rangePickerRype = "rangePicker_type_list",
  title = "选择数据",
  columns = [],
  tableProps = {},
  url = '',
  advancedFormProps = {},
  params = {},
  modalProps = {},
  selectByBtn = false,
  multiSelect = false,
  checkboxProps = {},
  quickSearchProperties = ['code', 'name'],
  filterFunc = defaultfilterFunc
}, ref) => {
  const newSearchParam = searchParam || {};
  const tableRef = useRef();
  const selectAdvancedRef = useRef();
  const [visible, setVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchValue, setSearchValue] = useState({
    filters: searchDataPackaged(newSearchParam),
    quickSearchProperties
  });

  useEffect(() => {
    if (!visible) {
      setSearchValue((state) => ({
        ...state,
        filters: searchDataPackaged(newSearchParam),
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    setSearchValue(state => ({
      ...state,
      filters: searchDataPackaged(newSearchParam),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam])

  function onSelectRow(rowKeys, rows) {
    setSelectedRowKeys(rowKeys);
    setSelected(rows)
  }

  useImperativeHandle(ref, () => {
    return {
      open,
      onSelectRow
    };
  });

  const options = {
    columns: !!selectByBtn ? [
      {
        title: "操作",
        dataIndex: "handle",
        render(t, r) {
          return <Button
            size='small'
            icon="plus"
            onClick={
              () => {
                setData(r)
                open(false)
              }
            }
          >{selectByBtn}</Button>
        }
      },
      ...columns
    ] : columns,
    checkbox: !!selectByBtn ? false : { multiSelect, ...checkboxProps },
    rowKey: 'id',
    store: {
      url,
      type: 'POST',
      params: {
        ...searchValue,
        ...params,
      },
      autoLoad: true,
    },
    allowCancelSelect: true,
    remotePaging: true,
    showSearch: false,
    selectedRowKeys,
    onSelectRow,
    refreshButton: 'empty',
    ...tableProps
  };

  function handleTableData(inVals, { value_search: valueSearch, ...outVal } = {}) {

    const filterVals = filterFunc({ ...inVals, ...outVal, ...newSearchParam, });
    const filters = searchDataPackaged(filterVals, rangePickerRype);

    setSearchValue({
      ...searchValue,
      quickSearchValue: valueSearch,
      filters,
    });

    if (tableRef && tableRef.current) {
      tableRef.current.handlerPageChange(1, tableRef.current.state.pagination.pageSize)
    }
  }

  function onOk() {
    if (multiSelect) {
      setData(selected)
    } else {
      setData(selected[0])
    }
    open(false)
  }

  function open(flag = true) {
    setVisible(flag)
    if (!flag) {
      onSelectRow([], [])
    }
  }

  return (
    <>
      {children && <div onClick={() => setVisible(true)} style={{ display: "inline-block" }}>{children}</div>}
      <Modal
        title={title}
        visible={visible}
        width='80%'
        style={{ top: 80 }}
        bodyStyle={{ overflow: 'auto' }}
        maskClosable={false}
        destroyOnClose
        onOk={onOk}
        onCancel={() => open(false)}
        forceRender
        {...modalProps}
      >
        <header>
          <Header
            right={
              <>
                <AdvancedForm
                  formSpan={24}
                  ref={selectAdvancedRef}
                  onOk={handleTableData}
                  outFormBoxProps={{ styleBox: { flex: 1 }, }}
                  outSearchBtn={true}
                  {...advancedFormProps}
                />
              </>
            }
          />
        </header>
        <ExtTable {...options} height={600} ref={tableRef} />
      </Modal>
    </>
  );
});

export default SelectTable;
