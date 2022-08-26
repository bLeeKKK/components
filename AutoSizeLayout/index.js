import React, { useRef, useLayoutEffect, useState } from 'react';

function AutoSizeLayout({ children, minHeight = 300, detHeight = 0 }) {
  const layoutRef = useRef(null);
  const [height, setHeight] = useState(minHeight);
  const computed = () => {
    const height = document.body.clientHeight - (layoutRef && layoutRef.current ? layoutRef.current.getBoundingClientRect().top : 0);
    setHeight(height);
  };

  // const setHeightFun = () => {
  //   const getHeight = computed();
  //   setHeight(getHeight);
  // };

  useLayoutEffect(() => {
    computed();
    window.addEventListener('resize', computed);

    return () => window.removeEventListener('resize', computed);
  }, []);

  return (
    <div
      ref={layoutRef}
      id="ni-hao-table"
      style={{
        height: `${height + detHeight}px`,
        minHeight,
      }}
    >
      {children('100%')}
    </div>
  );
}

export default AutoSizeLayout;
