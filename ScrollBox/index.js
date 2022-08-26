import React, { useEffect, forwardRef, useState, useRef, useImperativeHandle } from 'react';
import { Link, Element, Events } from 'react-scroll';
import styles from './styles.less';

/** 
 * @description: 滚动条组件
 * @param {string} id 容器id 默认：scroll-container
 * @param {style} warrperStyle 容器样式 默认：{ height: '100%' }
 * @param {ReactDOM} children 所有子组件，需要属性 id 和 title（必传）
 * @return: 返回包裹后的可滚动组件
 * 
 * @example:
 * <ScrollBox id="scroll-container" warrperStyle={{ height: '100%' }}>
 *  <Card title={'基本信息'} id='formBox'>
 *   Some content
 *  </Card>
 *  <Card title={'商品明细'} id='orderInfo' style={{ margin: '16px 0' }}>
 *    Some content
 *  </Card>
 * </ScrollBox>
 * */

const ScrollBox = forwardRef(
  (
    {
      id = "scroll-container",
      warrperStyle = { height: '100%' },
      children,
    },
    ref,
  ) => {

    const [activeKey, setActiveKey] = useState(children[0]?.props?.id);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [widthInk, setWidthInk] = useState(0);
    const barRef = useRef();

    useImperativeHandle(ref, () => ({}));

    useEffect(() => {
      Events.scrollEvent.register(id, function () {
        console(id, arguments);
      });
      return () => { Events.scrollEvent.remove(id); }
    }, []);
    useEffect(() => {
      const dom = barRef.current.getElementsByClassName(styles['active'])?.[0]
      setWidthInk(dom?.offsetWidth);
      setScrollLeft(dom?.offsetLeft || 0);
    }, [activeKey])

    return <>
      <div style={warrperStyle}>
        <div className={styles['bar-box']} ref={barRef}>
          {
            children
              .map((item) => {
                return <Link
                  key={item.props.id}
                  className={`${styles['bar-item']} ${activeKey === item.props.id ? styles['active'] : ''}`}
                  containerId={id}
                  to={item.props.id}
                  smooth={true}
                  spy={true}
                  duration={500}
                  onSetActive={(key) => setActiveKey(key)}
                  onClick={() => { setActiveKey(item.props.id) }}
                >
                  {item.props.title}
                </Link>
              })
          }
          <div className={styles['ink-bar']} style={{ width: `${widthInk}px`, transform: `translate3d(${scrollLeft}px, 0px, 0px)` }}></div>
        </div>

        <Element id={id} style={{ overflow: 'auto', height: 'calc(100% - 46px)', width: '100%' }}>
          {
            children
              .map((item) => <Element name={item.props.id} key={item.props.id}>
                {item}
              </Element>)
          }
        </Element>
      </div>
    </>
  },
);

export default ScrollBox