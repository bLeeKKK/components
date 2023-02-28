import React from 'react';
import { Empty, Timeline, Spin } from 'antd';
import moment from 'moment';

export default function Log({ list = [], loading = false }) {
  return (
    <>
      <Spin spinning={loading}>
        {list.length ? (
          <Timeline>
            {list.map(res => (
              <Timeline.Item color="green" key={res.id}>
                <h4>{moment(res.createdDate).format('llll')}</h4>
                <p>
                  {/* <Avatar style={{ display: "inline-block", marginRight: "4px" }} icon="user" size="small"></Avatar> */}
                  <span style={{ display: 'inline-block' }}>{res.lastEditorName}</span>
                </p>
                <h4>操作描述：</h4>
                <pre>{res.remark}</pre>
                {/* <p>操作对象ID：{res.clueId}</p> */}
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Empty />
        )}
      </Spin>
    </>
  );
}
