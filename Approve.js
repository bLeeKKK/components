import React from 'react';
import { WorkFlow } from '@sei/suid';
import { useControllableValue } from 'ahooks';
import constants from '@/utils/constants';

const { StartFlow } = WorkFlow;
const { SERVER_PATH } = constants;
const Approve = ({ show, businessKey, businessModelCode, ...props }) => {
  const [loading, setLoading] = useControllableValue(props); // [loading, setLoading

  return (
    <>
      <StartFlow
        beforeStart={() => {
          setLoading(true);
          if (loading)
            return Promise.resolve({
              success: false,
              message: '请勿重复提交',
              data: null,
            });
          return Promise.resolve({
            data: { businessKey },
            success: true,
          });
        }}
        onCancel={() => setLoading(false)}
        startComplete={() => {
          setLoading(false);
        }}
        store={{ baseUrl: SERVER_PATH }}
        businessModelCode={businessModelCode}
        style={{ cursor: 'pointer' }}
      >
        {() => <div>{show}</div>}
      </StartFlow>
    </>
  );
};

export default Approve;
