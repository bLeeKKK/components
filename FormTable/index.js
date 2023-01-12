import React, { useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Table } from 'antd';
import FormBox, { Combos } from '@/components/FormBox';

function EditableRow(props) {
  const { ...restProps } = props;
  return <tr {...restProps} />;
}

function EditableCell(props) {
  const renderCell = () => {
    const { children, form, iteminput, rowkey, record, edit, intorow, dataIndex } = props;

    return form && iteminput && edit
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

  if (iteminput.type) {
    input = getFieldDecorator(`${name}.${iteminput.key}_${iteminput.type}`, {
      rules,
      initialValue: iteminput.props?.initialValue || record[dataIndex],
    })(
      <Item
        record={record}
        allowClear
        form={form}
        name={`${iteminput.key}_${iteminput.type}`}
        style={{ width: '100%' }}
        {...iteminput.props}
        onChange={newOnchange}
      />,
    );
  } else {
    input = getFieldDecorator(`${name}.${iteminput.key}`, {
      rules,
      initialValue: iteminput.props?.initialValue || record[dataIndex],
    })(
      <Input
        record={record}
        form={form}
        style={{ width: '100%' }}
        name={`${iteminput.key}_${iteminput.type}`}
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

      intorow = false,
      hideForm = [],
      ...props
    },
    ref,
  ) => {
    // 暂支持请求数据分页

    useImperativeHandle(ref, () => {
      return form;
    });

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
          };
        },
      };
    });

    const newArr = [];

    dataSource.forEach(res => {
      hideForm.forEach(re => {
        newArr.push({
          ...res,
          key: `${res.id}.${re.key}`,
          props: {
            initialValue: res[re.key],
            ...(re?.props || {}),
          },
        });
      });
    });

    return (
      visible && (
        <>
          <Table
            showSearch={false}
            dataSource={dataSource}
            columns={newColumns}
            rowKey={rowkey}
            pagination={false}
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
    return <FormTable form={form} {...props} ref={ref} />;
  }
  return <FormCom {...props} ref={ref} />;
});

export default WForm;
