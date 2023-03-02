import React from 'react';
import { message, Tooltip, Icon } from 'antd';
import copy from 'copy-to-clipboard';
import { ExtIcon } from '@sei/suid';

function copyText(text) {
  if (copy(text)) {
    message.success('复制成功');
  } else {
    message.error('复制失败');
  }
}

function CopyTip({ text, children }) {
  const [copySucesss, setCopySucesss] = React.useState(false);

  return (
    <>
      {text && (
        <>
          {copySucesss ? (
            <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
          ) : (
            <ExtIcon
              tooltip={{ title: '复制' }}
              type="copy"
              antd
              onClick={e => {
                copyText(text);
                e.stopPropagation();
                setCopySucesss(true);
                setTimeout(() => {
                  setCopySucesss(false);
                }, 2000);
              }}
              style={{ color: 'rgb(28,129,230)' }}
            />
          )}
        </>
      )}
      &nbsp;
      <Tooltip placement="top" title={text}>
        {children || text}
      </Tooltip>
    </>
  );
}

export default CopyTip;
