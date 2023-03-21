import React, { useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Table } from 'antd';
import FormBox, { Combos, packageData } from '@/components/FormBox';

function EditableRow(props) {
  const { ...restProps } = props;
  return <tr {...restProps} />;
}

function EditableCell(props) {
  const renderCell = () => {
    const { children, form, iteminput, rowkey, record, edit, intorow, dataIndex, justShow } = props;

    return form && iteminput && edit && !justShow
      ? renderInput({
          iteminput,
          form,
          rowkey,
          record,
          intorow,
          dataIndex,
        })
      : children;
  };

  const { editable, dataIndex, title, record, index, children, ...restProps } = props;

  return <td {...restProps}>{renderCell()}</td>;
}

function renderInput({ iteminput, form, rowkey, record, intorow = false, dataIndex }) {
  if (!form) return '';
  let name = '';
  if (typeof rowkey === 'function') {
    name = rowkey(record);
  } else {
    name = record[rowkey];
  }

  const Item = Combos[iteminput.type] || Input;
  const { getFieldDecorator } = form;
  let input = null;
  let rules = iteminput.rules || [];
  let newOnchange = () => {};
  if (iteminput?.props?.onChange) {
    newOnchange = function(...props) {
      iteminput.props.onChange.call(this, ...props, record, form);
    };
  }
  if (typeof rules === 'function') rules = rules(record);

  // 默认为表单带上 record
  if (intorow) getFieldDecorator(`${name}.record`, { initialValue: record })(<Input />);

  const val = record[iteminput.key];
  const initVal =
    typeof iteminput.props?.initialValue === 'function'
      ? iteminput.props?.initialValue(val, record)
      : val || iteminput.props?.initialValue;
  if (iteminput.type) {
    input = getFieldDecorator(`${name}.${iteminput.key}_${iteminput.type}`, {
      rules,
      initialValue: initVal,
    })(
      <Item
        record={record}
        allowClear
        form={form}
        name={`${name}.${iteminput.key}_${iteminput.type}`}
        style={{ width: '100%' }}
        {...iteminput.props}
        onChange={newOnchange}
      />,
    );
  } else {
    input = getFieldDecorator(`${name}.${iteminput.key}`, {
      rules,
      initialValue: initVal,
    })(
      <Input
        record={record}
        form={form}
        style={{ width: '100%' }}
        name={`${name}.${iteminput.key}`}
        {...iteminput.props}
        onChange={newOnchange}
      />,
    );
  }

  return <Form.Item style={{ marginBottom: 0 }}>{input}</Form.Item>;
}

/**
 * @param {rowkey} "id"
 */
const FormTable = forwardRef(
  (
    {
      visible = true,
      columns = [],
      dataSource = [],
      form,
      rowkey = 'id',

      justShow = false,
      intorow = false,
      hideForm = [],
      ...props
    },
    ref,
  ) => {
    // 暂支持请求数据分页

    const getDataSourceMergeForm = ({ packageOptions = {} } = {}) => {
      const newDataSource = JSON.parse(JSON.stringify(dataSource));
      const tableValueMap = form.getFieldsValue();
      const arr = newDataSource.map(res => {
        const item = tableValueMap[res.id];
        if (item) {
          return {
            ...res,
            ...packageData({ vals: item, ...packageOptions }),
          };
        }
        return res;
      });
      return arr;
    };

    useImperativeHandle(ref, () => ({ form, getDataSourceMergeForm }));

    const newColumns = columns.map(item => {
      return {
        ...item,
        onCell: record => {
          const obj = { ...item };
          if (typeof obj.iteminput === 'function') {
            obj.iteminput = obj.iteminput(record, form);
          }
          if (typeof obj.edit === 'function') {
            obj.edit = obj.edit(record, form);
          }
          return {
            record,
            form,
            rowkey, // 注意大小写
            edit: obj.edit,
            iteminput: obj.iteminput,
            intorow,
            dataIndex: obj.dataIndex,
            justShow,
          };
        },
      };
    });

    const newArr = [];

    dataSource.forEach(res => {
      hideForm.forEach(re => {
        const val = res[re.key];
        const initVal =
          typeof re.props?.initialValue === 'function'
            ? re.props?.initialValue(val, res)
            : val || re.props?.initialValue;
        newArr.push({
          ...res,
          key: `${res.id}.${re.key}`,
          props: {
            initialValue: initVal,
            ...(re?.props || {}),
          },
        });
      });
    });

    return (
      visible && (
        <>
          <Table
            bordered
            showSearch={false}
            dataSource={dataSource}
            columns={newColumns}
            rowKey={rowkey}
            pagination={false}
            width="100%"
            scroll={{ x: 'max-content' }}
            {...props}
            components={{
              body: {
                row: EditableRow,
                cell: EditableCell,
              },
            }}
          />

          {/* 隐藏表单字段 */}
          <div style={{ display: 'none' }}>
            <FormBox form={form} formItems={newArr} />
          </div>
        </>
      )
    );
  },
);

/**
 * 表单包裹组件
 * 可以出入自定义 Form 表单
 */
const FormCom = Form.create({
  onValuesChange(props, value) {
    if (props.onValuesChange) props.onValuesChange(props, value);
  },
  onFieldsChange(props, changedFields) {
    if (props.onFieldsChange) props.onFieldsChange(props, changedFields);
  },
})(FormTable);

const WForm = forwardRef(({ form, ...props }, ref) => {
  if (form) {
    return <FormTable {...props} form={form} ref={ref} />;
  }
  return <FormCom {...props} wrappedComponentRef={ref} />;
});

export default WForm;
