import React from 'react';
import { utils } from '@sei/suid'
import { Button } from 'antd';
import { DEVELOPER_ENV } from '../constants';
const { authAction } = utils;

// const DEVELOPER_ENV = process.env.NODE_ENV === 'development' ? "true" : "false"

function PerBtn({
  children,
  pKey,
  ...props
}) {

  if (!pKey) {
    return "请传入key值属性，或直接使用Button组件"
  }

  return (
    <>
      {
        authAction(<Button
          // onClick={() => alert("请绑定点击事件")}
          key={pKey}
          ignore={DEVELOPER_ENV}
          style={{ marginRight: "8px" }}
          {...props}
        >
          {children}
        </Button>)
      }
    </>
  )
}

export default PerBtn