import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { Form, Dropdown, Menu, Button, Icon, Comment, Avatar, Tooltip, Timeline } from 'antd';
import moment from 'moment';
import IconsBox from '@/components/IconsBox';
import styles from './styles.less';
import constants, { SEI_COMMONS_DATA } from '@/utils/constants';
import { ICON_PAPER_CLIP } from '@/components/icons';
import EditFile from '@/components/EditFile';
import FormBox, { packageDataIn } from '@/components/FormBox';

const { SERVER_PATH } = constants;

const langDefault = [
  '电无人接听',
  '客户无意向',
  '客户意向度适中，后续继续跟进',
  '客户意向度较强，成交几率较大',
];
export function CommonLanguage({ form, setStr = 'remark_textarea', lang = langDefault }) {
  return (
    <Dropdown
      overlay={
        <Menu>
          {lang.map(str => (
            <Menu.Item
              key={str}
              onClick={() => {
                if (form)
                  form.setFieldsValue({
                    [setStr]: str,
                  });
              }}
            >
              {str}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button>
        常用语 <Icon type="down" />
      </Button>
    </Dropdown>
  );
}

// 展示内容
export const MyComment = ({ data = {}, iconArr = [] }) => {
  return (
    <div style={{ position: 'relative' }}>
      <Comment
        author={data.creatorName}
        avatar={
          <Avatar style={{ backgroundColor: '#1791ff', verticalAlign: 'middle' }}>
            {data.creatorName?.substring(0, 2)}
          </Avatar>
        }
        datetime={
          <>
            <Tooltip title={moment(data.createdDate).format('YYYY-MM-DD HH:mm:ss')}>
              <span>{moment(data.createdDate).fromNow()}</span>
            </Tooltip>
            <span className={styles['type-name']}>{data.typeName}</span>
          </>
        }
        content={
          <>
            <p>{data.remark}</p>
            {data.nextContactTime ? (
              <div>
                <Icon type="clock-circle" />
                <span style={{ marginLeft: '4px', display: 'inline-block' }}>
                  下次联系时间：{moment(data.nextContactTime).format('YYYY-MM-DD')}
                </span>
              </div>
            ) : (
              ''
            )}
          </>
        }
      />
      <div style={{ position: 'absolute', top: '4px', right: '8px' }}>
        <IconsBox btnIconArr={iconArr} />
      </div>
    </div>
  );
};

export const MyTimeline = ({ item, date, com = () => { } }) => {
  return (
    <>
      <span className={styles['timer-head']}>{moment(date).format('YYYY-MM-DD')}</span>
      <Timeline>
        {item.map(res => (
          <Timeline.Item key={res?.id} dot={<Icon type="message" style={{ fontSize: '16px' }} />}>
            {com(res)}
          </Timeline.Item>
        ))}
      </Timeline>
    </>
  );
};

// ----------------------------编辑跟随表单-----------------------------------start
export const addItems = ({ render } = {}) => [
  {
    key: 'typeCode',
    // span: 2,
    type: 'select',
    formLayouts: { labelCol: { span: 0 }, wrapperCol: { span: 24 } },
    rules: [{ required: true, message: '请选择联系方式' }],

    styleCol: { width: '150px' },
    props: {
      initialValue: 'DDH',
      allowClear: false,
      store: {
        url: `${SERVER_PATH}/${SEI_COMMONS_DATA}/dataDict/getCanUseDataDictValues?dictCode=FOLLOW-UP-TYPE`,
        method: 'GET',
        headers: { neverCancel: true },
        data: {},
      },
      onChange(val, data) {
        if (val) {
          this.form.setFieldsValue({
            typeName: data.dataName,
          });
        }
      },
      // style: { width: "100px" }
    },
  },
  {
    key: 'typeName',
    hide: true,
    props: {
      initialValue: '打电话',
    },
  },
  {
    title: '下次联系时间',
    key: 'nextContactTime',
    type: 'datePicker',
    styleCol: { width: '340px' },
    // rules: [{ required: true, message: '请选择下次联系时间' }],
    props: {
      placeholder: '请选择下次联系时间',
      disabledDate(current) {
        // Can not select days before today and today
        return current && current < moment().endOf('day');
      },
    },
  },
  {
    // title: '附件',
    key: 'files',
    type: 'show',
    styleCol: { width: '150px' },
    // rules: [{ required: true, message: '请选择下次联系时间' }],
    formLayouts: { labelCol: { span: 0 }, wrapperCol: { span: 24 } },
    render,
  },
  {
    key: 'remark',
    type: 'textarea',
    span: 24,
    formLayouts: { labelCol: { span: 0 }, wrapperCol: { span: 24 } },
    rules: [{ required: true, message: '请输入描述' }],
    props: {
      style: { border: 0 },
      placeholder: '请输入跟进描述......',
    },
  },
];
// 提交，新增\编辑
const EditorConter = forwardRef(({ form, data, lang, edit }, ref) => {
  const editFileRef = useRef();

  useImperativeHandle(ref, () => ({
    form,
    file: editFileRef.current,
  }));

  useEffect(() => {
    if (data) {
      const obj = packageDataIn({
        items: addItems(),
        show: data,
      });
      form.setFieldsValue(obj);
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const iconArr = [
    {
      tooltip: { title: '附件' },
      type: ICON_PAPER_CLIP,
      key: 'PRECLUE-DELETE',
      render: (_, __, icon) => {
        const EditFileDom = (
          <EditFile entityId={edit?.id} showCount={false} limtMax={12} ref={editFileRef} windMode directlyBind>
            {icon}
          </EditFile>
        );
        return <>{EditFileDom}</>;
      },
    },
  ];

  return (
    <FormBox
      form={form}
      span={6}
      formItems={addItems({
        render: (_, __, formNow) => (
          <>
            <div style={{ lineHeight: '40px', display: 'flex' }}>
              {data ? null : (
                <div style={{ marginLeft: '8px' }}>
                  <IconsBox btnIconArr={iconArr} />
                </div>
              )}
              <div style={{ marginLeft: '8px' }}>
                <CommonLanguage form={formNow} lang={lang} />
              </div>
            </div>
          </>
        ),
      })}
      styleItem={{ marginBottom: '8px' }}
    />
  );
});
export const FormEditorConter = Form.create()(EditorConter);
// ----------------------------编辑跟随表单-----------------------------------end
