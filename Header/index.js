import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';

const Header = ({ left = null, right = null }) => {
  return (
    <div className={classnames([styles.wrapper, styles.flexBetweenStart])}>
      <div className={styles['header-left']}>{left}</div>
      <div className={styles['header-right']}>{right}</div>
    </div>
  );
};

Header.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
};

export default Header;
