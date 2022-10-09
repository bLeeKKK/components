import React, { forwardRef } from 'react';
import { ExtTable } from '@sei/suid';

const MyTable = forwardRef((props, ref) => {
  return <ExtTable
    bordered
    {...props}
    ref={ref}
  />
})

export default MyTable;
