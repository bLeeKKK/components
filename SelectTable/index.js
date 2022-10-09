import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { ExtTable } from 'suid';
import Header from '@/components/Header';
import AdvancedForm, { searchDataPackaged } from '@/components/AdvancedForm';

const SelectTable = forwardRef(({
  setData = function () { },
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
  quickSearchProperties
}, ref) => {
  let newSearchParam = searchParam || {};
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
      setSearchValue({
        filters: searchDataPackaged(newSearchParam),
        quickSearchProperties,
      })
    }
  }, [visible]);

  useEffect(() => {
    setSearchValue({
      filters: searchDataPackaged(newSearchParam),
      quickSearchProperties
    })
  }, [searchParam])

  useImperativeHandle(ref, () => {
    return {
      opan
    };
  });

  function onSelectRow(rowKeys, rows) {
    setSelectedRowKeys(rowKeys);
    setSelected(rows)
  }

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
                opan(false)
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

    const filters = searchDataPackaged({
      ...inVals,
      ...outVal,
      ...newSearchParam,
    }, rangePickerRype);

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
    opan(false)
  }

  function opan(flag = true) {
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
        width={'80%'}
        style={{ top: 80 }}
        bodyStyle={{ overflow: 'auto' }}
        maskClosable={false}
        destroyOnClose={true}
        onOk={onOk}
        onCancel={() => opan(false)}
        forceRender={true}
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
