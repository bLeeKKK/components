import React from 'react'
import { message, Tooltip } from 'antd'
import copy from 'copy-to-clipboard'
import { ExtIcon } from 'suid'

function copyText(text) {
  if (copy(text)) {
    message.success("复制成功")
  } else {
    message.error("复制失败")
  }
}

function CopyTip({
  text,
  children
}) {

  return <>
    {
      text && <ExtIcon
        tooltip={{ title: '复制' }}
        type="copy"
        antd
        onClick={(e) => {
          copyText(text)
          e.stopPropagation()
        }}
        style={{ color: 'rgb(28,129,230)' }}
      />
    }
    <Tooltip placement="top" title={text}>
      {children}
    </Tooltip>
  </>
}

export default CopyTip