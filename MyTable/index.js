import React, { forwardRef } from 'react';
import { ExtTable } from '@sei/suid';

const MyTable = forwardRef((props, ref) => {
  return <ExtTable {...props} ref={ref} />
})

export default MyTable;
