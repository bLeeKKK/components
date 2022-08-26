import React from 'react';
import { ExtIcon, utils } from '@sei/suid';
import { Divider, Icon, Dropdown, Menu } from 'antd';
import styles from './index.less';
import { DEVELOPER_ENV } from '../constants';

export const IconStyle = {
  // color: '#1890ff'
}
const { authAction } = utils;

const IconsBox = ({ btnIconArr = [], limt }) => {
  // const [Visible, setVisible] = useState(false);
  const arr = btnIconArr.filter(res => !res.hide);
  const len = limt || arr.length;
  const beforArr = arr.splice(0, len);

  const resRender = (res, index) => {
    let { render, loading = false, ...resProps } = res;
    const ider = index === 0 ? '' : <Divider type="vertical" />
    const IconDom = <>
      {ider}
      {loading ? <ExtIcon style={IconStyle} type="loading" antd /> : <ExtIcon style={IconStyle}  {...resProps} hide={undefined} antd />}
    </>
    const IconDomA = res.key ? authAction(<span
      ignore={DEVELOPER_ENV}
      key={`${res.key}`}
    >
      {IconDom}
    </span>) : <ExtIcon style={IconStyle} {...resProps} hide={undefined} antd />;

    return render ? render(res, index, IconDomA, ider) : IconDomA
  };

  const resRenderMenuItem = (res, index) => {
    let { render, loading = false, ...resProps } = res;

    // const DomA = res.key ? (
    //   authAction(
    //     <Menu.Item
    //       {...resProps}
    //       hide={undefined}
    //       ignore={DEVELOPER_ENV}
    //       key={res.key}
    //       style={{ textAlign: 'center' }}
    //       disabled={loading}
    //     >
    //       {loading ? <ExtIcon style={IconStyle} type="loading" antd /> : null} {res.tooltip?.title || '请传入标题'}
    //     </Menu.Item>,
    //   )
    // ) : (
    //   <Menu.Item
    //     {...resProps}
    //     hide={undefined}
    //     key={`${index}-list`}
    //     style={{ textAlign: 'center' }}
    //     disabled={loading}
    //   >
    //     {loading ? <ExtIcon style={IconStyle} type="loading" antd /> : null} {res.tooltip?.title || '请传入标题'}
    //   </Menu.Item>
    // );

    // return render ? render(res, index, DomA) : DomA

    let DomA = <>
      {loading ? <ExtIcon style={IconStyle} type="loading" antd /> : null} {res.tooltip?.title || '请传入标题'}
    </>

    DomA = render ? render(res, index, DomA) : DomA

    return res.key ? authAction(
      <Menu.Item
        {...resProps}
        hide={undefined}
        ignore={DEVELOPER_ENV}
        key={res.key}
        style={{ textAlign: 'center' }}
        disabled={loading}
      >
        {DomA}
      </Menu.Item>,
    ) : <Menu.Item
      {...resProps}
      hide={undefined}
      key={`${index}-list`}
      style={{ textAlign: 'center' }}
      disabled={loading}
    >
      {DomA}
    </Menu.Item>
  };

  return (
    <>
      {
        beforArr.map((res, index) => <span key={'map-' + index}>
          {resRender(res, index)}
        </span>)
      }
      {
        arr.length ? <Dropdown
          overlay={
            <Menu>
              {
                arr.map((res, index) => resRenderMenuItem(res, index))
              }
            </Menu>
          }
        >
          <span>
            <Divider type="vertical" />
            <Icon className={styles.icon} type="more" />
          </span>
        </Dropdown> : null
      }
      {/* {
        arr.length ? (
          <Popover
            visible={Visible}
            placement="rightTop"
            trigger="click"
            overlayClassName={styles.rowRightCard}
            content={
              <div>
                {
                  arr.map((item, index) => {
                    return item.key ? (
                      authAction(
                        <div
                          className={styles.rowRightList}
                          ignore={DEVELOPER_ENV}
                          key={item.key}
                          onClick={e => {
                            e.stopPropagation();
                            item.onClick();
                          }}
                        >
                          {item.tooltip?.title || '请传入标题'}
                        </div>,
                      )
                    ) : (
                      <div
                        className={styles.rowRightList}
                        key={`${index}-list`}
                        onClick={e => {
                          e.stopPropagation();
                          item.onClick();
                        }}
                      >
                        {item.tooltip?.title || '请传入标题'}
                      </div>
                    );
                  })
                }
              </div>
            }
            onVisibleChange={visible => {
              setVisible(visible);
            }}
          >
            <span
              style={{ display: 'inline-block', marginLeft: '5px' }}
              onClick={e => {
                e.stopPropagation();
                setVisible(true);
              }}
            >
              <Icon className={styles.icon} type="more" />
            </span>
          </Popover>
        ) : null
      } */}
    </>
  );
};

export default IconsBox;
