import React from 'react';

export default function TitleBox({ title }) {
  return (
    <>
      {title && (
        <h3
          style={{ borderBottom: '1px solid #e9e9e9', paddingBottom: '8px', paddingLeft: '16px' }}
        >
          {title}
        </h3>
      )}
    </>
  );
}
