import React, { useImperativeHandle, forwardRef } from "react";
import { ExtTable } from "suid";
import { Form, Input } from "antd";
import FormBox, { Combos } from "@/components/FormBox";

class EditableCell extends React.Component {
  // 列-数据战术
  renderCell = () => {
    const { children, form, iteminput, rowkey, record, edit, intorow, dataIndex } = this.props;

    return (form && iteminput && !!edit) ? renderInput({
      iteminput, form,
      rowkey, record, intorow, dataIndex
    }) : children;
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      children,
      ...restProps
    } = this.props;

    return (
      <td {...restProps}>
        {this.renderCell()}
      </td>
    );
  }
}

function renderInput({
  iteminput, form,
  rowkey, record, intorow = false, dataIndex
}) {
  if (!form) {
    return ''
  }
  let name = ''
  if (typeof rowkey === "function") {
    name = rowkey(record)
  } else {
    name = record[rowkey]
  }

  const Item = Combos[iteminput.type] || Input
  const { getFieldDecorator } = form
  let input = null
  let rules = iteminput.rules || []
  let newOnchange = () => { }
  if (iteminput?.props?.onChange) {
    newOnchange = function (...props) { iteminput.props.onChange.call(this, ...props, record, form) }
  }
  if (typeof rules === "function") {
    rules = rules(record)
  }
  if (intorow) {
    getFieldDecorator(`${name}.record`, {
      initialValue: record,
    })(<Input />)
  }

  if (iteminput.type) {
    input = getFieldDecorator(`${name}.${iteminput.key}_${iteminput.type}`,
      {
        rules,
        initialValue: iteminput.props?.initialValue || record[dataIndex],
      })(
        <Item
          record={record}
          allowClear={true}
          form={form}
          name={`${iteminput.key}_${iteminput.type}`}
          style={{ width: "100%" }}
          field={[`${iteminput.field ? `${iteminput.field}_${iteminput.type}` : iteminput.key}`]}
          {...iteminput.props}
          onChange={newOnchange}
        />
      )
  } else {
    input = getFieldDecorator(`${name}.${iteminput.key}`, {
      rules,
      initialValue: iteminput.props?.initialValue || record[dataIndex],
    })(
      <Input
        record={record}
        form={form}
        style={{ width: "100%" }}
        name={`${iteminput.key}_${iteminput.type}`}
        {...iteminput.props}
        onChange={newOnchange}
      />,
    )
  }

  return <Form.Item
    style={{ marginBottom: 0 }}
  >
    {input}
  </Form.Item>
}

/**
 * @param {rowKey} "id"
*/

function FormTable({
  visible,
  columns,
  dataSource = [],
  form,
  rowKey = "id",
  intorow = false,
  hideForm = [],
  ...props
}, ref) {
  // 暂支持请求数据分页

  useImperativeHandle(ref, () => {
    return form;
  });


  columns = columns.map(item => {
    return {
      ...item,
      onCell: (record) => {
        let obj = { ...item }
        if (typeof obj.iteminput === "function") {
          obj.iteminput = obj.iteminput(record, form)
        }
        if (typeof obj.edit === "function") {
          obj.edit = obj.edit(record, form)
        }
        return {
          record,
          form,
          rowkey: rowKey, // 注意大小写 
          edit: obj.edit ? 1 : 0,
          iteminput: obj.iteminput,
          intorow: intorow ? 1 : 0,
          dataIndex: item.dataIndex
        }
      },
    };
  });

  const newArr = []

  dataSource.forEach(res => {
    hideForm.forEach(re => {
      newArr.push({
        ...res,
        key: `${res.id}.${re.key}`,
        props: {
          initialValue: res[re.key],
          ...(re?.props || {}),
        }
      })
    })
  })

  return (visible && <>
    <ExtTable
      showSearch={false}
      dataSource={dataSource}
      columns={columns}
      rowKey={typeof rowKey === "function" ? rowKey : (r) => r[rowKey] || r.id}
      {...props}
      components={{
        body: {
          // row: EditableFormRow,
          cell: EditableCell,
        },
      }}
    />
    <div style={{ display: "none" }}>
      <FormBox
        form={form}
        formItems={newArr}
      />
    </div>
  </>)
}


export default Form.create({
  onValuesChange(props, value) {
    props.onValuesChange && props.onValuesChange(props, value);
  },
  onFieldsChange(props, changedFields) {
    props.onFieldsChange && props.onFieldsChange(props, changedFields);
  },
})(forwardRef(FormTable))
